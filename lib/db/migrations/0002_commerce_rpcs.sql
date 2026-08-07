-- Commerce RPCs for Cloudflare Workers via Supabase HTTPS (service role).
-- Apply in Supabase SQL Editor (or psql) after the base commerce schema exists.
-- These keep FOR UPDATE / multi-row inventory work atomic without TCP `pg` from the Worker.

-- Dispute status for charge.dispute.* webhooks
DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'disputed';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  released integer := 0;
BEGIN
  FOR r IN
    SELECT id, order_id, variant_id, quantity
    FROM inventory_reservations
    WHERE status = 'active' AND expires_at < NOW()
    FOR UPDATE
  LOOP
    UPDATE variants
    SET
      inventory_reserved = GREATEST(inventory_reserved - r.quantity, 0),
      updated_at = NOW()
    WHERE id = r.variant_id;

    UPDATE inventory_reservations
    SET status = 'released'
    WHERE id = r.id;

    UPDATE orders
    SET
      status = 'canceled',
      payment_status = 'failed',
      updated_at = NOW()
    WHERE id = r.order_id AND status = 'pending_payment';

    released := released + 1;
  END LOOP;
  RETURN released;
END;
$$;

CREATE OR REPLACE FUNCTION release_reservations_for_order(p_order_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, variant_id, quantity
    FROM inventory_reservations
    WHERE order_id = p_order_id AND status = 'active'
    FOR UPDATE
  LOOP
    UPDATE variants
    SET
      inventory_reserved = GREATEST(inventory_reserved - r.quantity, 0),
      updated_at = NOW()
    WHERE id = r.variant_id;

    UPDATE inventory_reservations
    SET status = 'released'
    WHERE id = r.id;
  END LOOP;

  UPDATE orders
  SET
    status = 'canceled',
    payment_status = 'failed',
    updated_at = NOW()
  WHERE id = p_order_id AND status = 'pending_payment';
END;
$$;

CREATE OR REPLACE FUNCTION convert_reservations_for_order(p_order_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  updated_id text;
BEGIN
  FOR r IN
    SELECT id, variant_id, quantity
    FROM inventory_reservations
    WHERE order_id = p_order_id AND status = 'active'
    FOR UPDATE
  LOOP
    UPDATE variants
    SET
      inventory_on_hand = inventory_on_hand - r.quantity,
      inventory_reserved = GREATEST(inventory_reserved - r.quantity, 0),
      updated_at = NOW()
    WHERE id = r.variant_id
      AND inventory_on_hand >= r.quantity
      AND inventory_reserved >= r.quantity
    RETURNING id INTO updated_id;

    IF updated_id IS NULL THEN
      RAISE EXCEPTION 'Failed to convert reservation for variant %', r.variant_id;
    END IF;

    UPDATE inventory_reservations
    SET status = 'converted'
    WHERE id = r.id;
  END LOOP;
END;
$$;

/**
 * Atomically validate cart, reserve inventory, create pending order + items + reservations.
 * p_items: [{"variantId":"...","quantity":1}, ...]
 * Returns jsonb: { ok, ... } or { ok:false, code, message, lines }
 */
CREATE OR REPLACE FUNCTION create_pending_checkout(
  p_items jsonb,
  p_order_id text,
  p_order_number text,
  p_expires_at timestamptz,
  p_shipping_cents integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  v_id text;
  v_qty integer;
  v RECORD;
  available integer;
  changed jsonb := '[]'::jsonb;
  prepared jsonb := '[]'::jsonb;
  subtotal integer := 0;
  line jsonb;
  res_id text;
  oi_id text;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'empty_cart', 'message', 'Cart is empty.');
  END IF;

  IF p_shipping_cents IS NULL OR p_shipping_cents < 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'config_error', 'message', 'Shipping is misconfigured.');
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_id := item->>'variantId';
    v_qty := (item->>'quantity')::integer;

    IF v_id IS NULL OR v_qty IS NULL OR v_qty < 1 THEN
      RETURN jsonb_build_object(
        'ok', false,
        'code', 'invalid_quantity',
        'message', 'Each line needs a variantId and positive quantity.'
      );
    END IF;

    SELECT
      v.id,
      v.sku,
      v.color,
      v.size,
      v.unit_amount,
      v.currency,
      v.inventory_on_hand,
      v.inventory_reserved,
      v.active AS variant_active,
      v.image_url,
      v.stripe_price_id,
      p.name AS product_name,
      p.active AS product_active
    INTO v
    FROM variants v
    INNER JOIN products p ON p.id = v.product_id
    WHERE v.id = v_id
    FOR UPDATE OF v;

    IF NOT FOUND THEN
      changed := changed || jsonb_build_array(jsonb_build_object('variantId', v_id, 'reason', 'missing'));
      CONTINUE;
    END IF;

    IF NOT v.variant_active OR NOT v.product_active THEN
      changed := changed || jsonb_build_array(jsonb_build_object('variantId', v_id, 'reason', 'inactive'));
      CONTINUE;
    END IF;

    available := v.inventory_on_hand - v.inventory_reserved;
    IF available <= 0 THEN
      changed := changed || jsonb_build_array(jsonb_build_object('variantId', v_id, 'reason', 'sold_out', 'available', 0));
      CONTINUE;
    END IF;
    IF v_qty > available THEN
      changed := changed || jsonb_build_array(jsonb_build_object('variantId', v_id, 'reason', 'insufficient', 'available', available));
      CONTINUE;
    END IF;

    UPDATE variants
    SET
      inventory_reserved = inventory_reserved + v_qty,
      updated_at = NOW()
    WHERE id = v_id
      AND active = true
      AND (inventory_on_hand - inventory_reserved) >= v_qty;

    IF NOT FOUND THEN
      changed := changed || jsonb_build_array(jsonb_build_object(
        'variantId', v_id,
        'reason', 'insufficient',
        'available', GREATEST(available, 0)
      ));
      CONTINUE;
    END IF;

    subtotal := subtotal + (v.unit_amount * v_qty);
    prepared := prepared || jsonb_build_array(jsonb_build_object(
      'variantId', v.id,
      'sku', v.sku,
      'name', v.product_name,
      'description', NULLIF(trim(both ' / ' from concat_ws(' / ', NULLIF(v.color, ''), NULLIF(v.size, ''))), ''),
      'unitAmount', v.unit_amount,
      'quantity', v_qty,
      'imageUrl', v.image_url,
      'stripePriceId', v.stripe_price_id,
      'color', v.color,
      'size', v.size
    ));
  END LOOP;

  IF jsonb_array_length(changed) > 0 THEN
    -- Roll back reservations made in this transaction by aborting
    RAISE EXCEPTION 'inventory_changed:%', changed::text
      USING ERRCODE = 'P0001';
  END IF;

  IF jsonb_array_length(prepared) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'empty_cart', 'message', 'Cart is empty.');
  END IF;

  INSERT INTO orders (
    id, order_number, status, payment_status,
    subtotal_amount, shipping_amount, tax_amount, discount_amount, total_amount,
    currency, reservation_expires_at
  ) VALUES (
    p_order_id, p_order_number, 'pending_payment', 'unpaid',
    subtotal, p_shipping_cents, 0, 0, subtotal + p_shipping_cents,
    'usd', p_expires_at
  );

  FOR line IN SELECT * FROM jsonb_array_elements(prepared)
  LOOP
    res_id := 'res_' || encode(gen_random_bytes(16), 'hex');
    oi_id := 'oi_' || encode(gen_random_bytes(16), 'hex');

    INSERT INTO inventory_reservations (id, order_id, variant_id, quantity, status, expires_at)
    VALUES (
      res_id,
      p_order_id,
      line->>'variantId',
      (line->>'quantity')::integer,
      'active',
      p_expires_at
    );

    INSERT INTO order_items (
      id, order_id, variant_id, sku, product_name, color, size, unit_amount, quantity, line_total
    ) VALUES (
      oi_id,
      p_order_id,
      line->>'variantId',
      line->>'sku',
      line->>'name',
      COALESCE(line->>'color', ''),
      COALESCE(line->>'size', ''),
      (line->>'unitAmount')::integer,
      (line->>'quantity')::integer,
      (line->>'unitAmount')::integer * (line->>'quantity')::integer
    );
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'orderId', p_order_id,
    'orderNumber', p_order_number,
    'subtotalAmount', subtotal,
    'shippingAmount', p_shipping_cents,
    'totalAmount', subtotal + p_shipping_cents,
    'currency', 'usd',
    'expiresAt', p_expires_at,
    'lineItems', prepared
  );
EXCEPTION
  WHEN SQLSTATE 'P0001' THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'inventory_changed',
      'message', 'Some items are no longer available as requested.',
      'lines', substring(SQLERRM from 'inventory_changed:(.*)$')::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION cleanup_expired_reservations() FROM PUBLIC;
REVOKE ALL ON FUNCTION release_reservations_for_order(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION convert_reservations_for_order(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION create_pending_checkout(jsonb, text, text, timestamptz, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION cleanup_expired_reservations() TO service_role;
GRANT EXECUTE ON FUNCTION release_reservations_for_order(text) TO service_role;
GRANT EXECUTE ON FUNCTION convert_reservations_for_order(text) TO service_role;
GRANT EXECUTE ON FUNCTION create_pending_checkout(jsonb, text, text, timestamptz, integer) TO service_role;
