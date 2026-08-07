import {
  DEFAULT_SHIPPING_CENTS,
  MAX_LINE_QTY,
  RESERVATION_TTL_MS,
  newId,
  newOrderNumber,
} from "./ids";
import { getSupabase } from "./supabase";

export type CartLineInput = { variantId: string; quantity: number };

export type InventoryChangedLine = {
  variantId: string;
  reason: "missing" | "inactive" | "sold_out" | "insufficient" | "invalid_quantity";
  available?: number;
};

export class CheckoutError extends Error {
  status: number;
  code: string;
  lines?: InventoryChangedLine[];

  constructor(
    status: number,
    code: string,
    message: string,
    lines?: InventoryChangedLine[],
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.lines = lines;
  }
}

function mergeLines(items: CartLineInput[]): CartLineInput[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const qty = Math.floor(Number(item.quantity));
    if (!item.variantId || !Number.isFinite(qty) || qty < 1) {
      throw new CheckoutError(
        400,
        "invalid_quantity",
        "Each line needs a variantId and positive quantity.",
      );
    }
    if (qty > MAX_LINE_QTY) {
      throw new CheckoutError(
        400,
        "invalid_quantity",
        `Quantity cannot exceed ${MAX_LINE_QTY} per line.`,
      );
    }
    map.set(item.variantId, (map.get(item.variantId) ?? 0) + qty);
  }
  return [...map.entries()].map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));
}

export async function releaseReservationsForOrder(orderId: string): Promise<void> {
  const { error } = await getSupabase().rpc("release_reservations_for_order", {
    p_order_id: orderId,
  });
  if (error) {
    throw new Error(`release_reservations_for_order: ${error.message}`);
  }
}

export async function convertReservationsForOrder(orderId: string): Promise<void> {
  const { error } = await getSupabase().rpc("convert_reservations_for_order", {
    p_order_id: orderId,
  });
  if (error) {
    throw new Error(`convert_reservations_for_order: ${error.message}`);
  }
}

export type PreparedCheckout = {
  orderId: string;
  orderNumber: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  expiresAt: Date;
  lineItems: Array<{
    variantId: string;
    sku: string;
    name: string;
    description: string;
    color: string;
    size: string;
    unitAmount: number;
    quantity: number;
    imageUrl: string | null;
    stripePriceId: string | null;
  }>;
};

type RpcCheckoutResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      subtotalAmount: number;
      shippingAmount: number;
      totalAmount: number;
      currency: string;
      expiresAt: string;
      lineItems: PreparedCheckout["lineItems"];
    }
  | {
      ok: false;
      code: string;
      message: string;
      lines?: InventoryChangedLine[];
    };

/**
 * Atomically validates cart, reserves inventory, and creates a pending order
 * via Postgres RPC (SECURITY DEFINER) over Supabase HTTPS.
 */
export async function createPendingCheckout(
  rawItems: CartLineInput[],
): Promise<PreparedCheckout> {
  const lines = mergeLines(rawItems);
  if (lines.length === 0) {
    throw new CheckoutError(400, "empty_cart", "Cart is empty.");
  }

  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);
  const orderId = newId("ord");
  const orderNumber = newOrderNumber();

  const shippingAmount =
    process.env.STRIPE_STANDARD_SHIPPING_AMOUNT_CENTS != null &&
    process.env.STRIPE_STANDARD_SHIPPING_AMOUNT_CENTS !== ""
      ? Number(process.env.STRIPE_STANDARD_SHIPPING_AMOUNT_CENTS)
      : DEFAULT_SHIPPING_CENTS;

  if (!Number.isFinite(shippingAmount) || shippingAmount < 0) {
    throw new CheckoutError(500, "config_error", "Shipping is misconfigured.");
  }

  const { data, error } = await getSupabase().rpc("create_pending_checkout", {
    p_items: lines.map((l) => ({
      variantId: l.variantId,
      quantity: l.quantity,
    })),
    p_order_id: orderId,
    p_order_number: orderNumber,
    p_expires_at: expiresAt.toISOString(),
    p_shipping_cents: shippingAmount,
  });

  if (error) {
    throw new Error(`create_pending_checkout: ${error.message}`);
  }

  const result = data as RpcCheckoutResult;
  if (!result || typeof result !== "object") {
    throw new Error("create_pending_checkout: empty RPC response");
  }

  if (!result.ok) {
    const status =
      result.code === "inventory_changed"
        ? 409
        : result.code === "config_error"
          ? 500
          : 400;
    throw new CheckoutError(
      status,
      result.code,
      result.message,
      result.lines,
    );
  }

  return {
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    subtotalAmount: result.subtotalAmount,
    shippingAmount: result.shippingAmount,
    totalAmount: result.totalAmount,
    currency: result.currency,
    expiresAt: new Date(result.expiresAt),
    lineItems: (result.lineItems ?? []).map((line) => ({
      ...line,
      description: line.description ?? "",
      imageUrl: line.imageUrl ?? null,
      stripePriceId: line.stripePriceId ?? null,
    })),
  };
}

export async function listCatalogAvailability() {
  const { data, error } = await getSupabase()
    .from("variants")
    .select(
      `
      id,
      sku,
      color,
      size,
      unit_amount,
      inventory_on_hand,
      inventory_reserved,
      active,
      image_url,
      product_id,
      products!inner (
        id,
        slug,
        name,
        active
      )
    `,
    );

  if (error) {
    throw new Error(`listCatalogAvailability: ${error.message}`);
  }

  return (data ?? []).map((r) => {
    const product = r.products as unknown as {
      id: string;
      slug: string;
      name: string;
      active: boolean;
    };
    const available = Math.max(
      0,
      (r.inventory_on_hand as number) - (r.inventory_reserved as number),
    );
    return {
      variantId: r.id as string,
      sku: r.sku as string,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      color: r.color as string,
      size: r.size as string,
      unitAmount: r.unit_amount as number,
      available,
      soldOut: available <= 0 || !r.active || !product.active,
      imageUrl: (r.image_url as string | null) ?? null,
    };
  });
}

export type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  subtotal_amount: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  reservation_expires_at: string | null;
};

export type OrderItemRow = {
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_amount: number;
  line_total: number;
  variant_id: string;
};

export async function getOrderById(orderId: string): Promise<OrderRow | null> {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error(`getOrderById: ${error.message}`);
  return data as OrderRow | null;
}

export async function getOrderBySessionId(
  sessionId: string,
): Promise<OrderRow | null> {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (error) throw new Error(`getOrderBySessionId: ${error.message}`);
  return data as OrderRow | null;
}

export async function getOrderByPaymentIntent(
  paymentIntentId: string,
): Promise<OrderRow | null> {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (error) throw new Error(`getOrderByPaymentIntent: ${error.message}`);
  return data as OrderRow | null;
}

export async function getOrderItems(orderId: string): Promise<OrderItemRow[]> {
  const { data, error } = await getSupabase()
    .from("order_items")
    .select(
      "product_name, color, size, quantity, unit_amount, line_total, variant_id",
    )
    .eq("order_id", orderId);
  if (error) throw new Error(`getOrderItems: ${error.message}`);
  return (data ?? []) as OrderItemRow[];
}

export async function updateOrderSessionId(
  orderId: string,
  sessionId: string,
): Promise<void> {
  const { error } = await getSupabase()
    .from("orders")
    .update({
      stripe_checkout_session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) throw new Error(`updateOrderSessionId: ${error.message}`);
}
