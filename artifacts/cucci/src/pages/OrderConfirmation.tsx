import { useEffect, useState, type CSSProperties } from "react";
import { Link, useSearch } from "wouter";
import { useCart } from "@/context/CartContext";
import { fetchOrderBySession, type OrderStatusDto } from "@/lib/api";
import { withBase } from "@/lib/withBase";

function formatCents(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

const MAX_POLLS = 12;
const POLL_MS = 2000;

export default function OrderConfirmationPage() {
  const search = useSearch();
  const sessionId = new URLSearchParams(search).get("session_id");
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderStatusDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [polls, setPolls] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing checkout session.");
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const load = async (attempt: number) => {
      try {
        const data = await fetchOrderBySession(sessionId);
        if (cancelled) return;
        setOrder(data);
        setError(null);

        if (data.status === "paid") {
          clearCart();
          try {
            sessionStorage.removeItem("cucci_checkout_order_id");
          } catch {
            /* ignore */
          }
          return;
        }

        if (
          (data.status === "processing" || data.status === "open") &&
          attempt < MAX_POLLS
        ) {
          setPolls(attempt + 1);
          timer = window.setTimeout(() => void load(attempt + 1), POLL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load order.");
        if (attempt < 4) {
          timer = window.setTimeout(() => void load(attempt + 1), POLL_MS);
        }
      }
    };

    void load(0);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [sessionId, clearCart]);

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        background: "#fff",
        minHeight: "100vh",
        color: "#1a1a1a",
      }}
    >
      <header
        style={{
          padding: "28px 24px",
          borderBottom: "1px solid #eee",
          textAlign: "center",
        }}
      >
        <a
          href={withBase("/")}
          style={{
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: "#111",
            fontSize: 13,
          }}
        >
          CUCCI
        </a>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px 80px" }}>
        {!sessionId && (
          <p style={{ fontSize: 14 }}>No session was provided. If you completed payment, check your email for a receipt.</p>
        )}

        {error && !order && (
          <div role="alert">
            <h1 style={heading}>We’re confirming your order</h1>
            <p style={body}>{error}</p>
          </div>
        )}

        {order?.status === "paid" && (
          <div>
            <h1 style={heading}>Thank you</h1>
            <p style={body}>
              Order <strong style={{ fontWeight: 500 }}>{order.orderNumber}</strong> is confirmed.
              {order.customerEmail ? ` A receipt will be sent to ${order.customerEmail}.` : ""}
            </p>
            <OrderSummary order={order} />
            <p style={{ ...body, marginTop: 28 }}>
              We’ll prepare your pieces for shipping. Track updates will follow once your order ships.
            </p>
            <Link href="/collections" style={linkStyle}>
              Continue shopping
            </Link>
          </div>
        )}

        {order?.status === "processing" && (
          <div>
            <h1 style={heading}>Payment processing</h1>
            <p style={body}>
              Your order {order.orderNumber} is still settling. This page refreshes automatically
              {polls > 0 ? ` (${polls}/${MAX_POLLS})` : ""}. Do not re-order — inventory is reserved.
            </p>
            <OrderSummary order={order} />
          </div>
        )}

        {order?.status === "open" && (
          <div>
            <h1 style={heading}>Checkout incomplete</h1>
            <p style={body}>Payment was not completed. You can return to checkout to finish.</p>
            <Link href="/checkout" style={linkStyle}>
              Return to checkout
            </Link>
          </div>
        )}

        {(order?.status === "expired" || order?.status === "failed") && (
          <div>
            <h1 style={heading}>Checkout ended</h1>
            <p style={body}>
              This session expired or payment failed. Reserved items have been released — please try again from your bag.
            </p>
            <Link href="/checkout" style={linkStyle}>
              Try again
            </Link>
          </div>
        )}

        {!order && !error && sessionId && (
          <div>
            <h1 style={heading}>Confirming payment…</h1>
            <p style={body}>Please wait while we verify your order with Stripe.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function OrderSummary({ order }: { order: OrderStatusDto }) {
  return (
    <div style={{ marginTop: 32, borderTop: "1px solid #eee" }}>
      {order.items.map((item, i) => (
        <div
          key={`${item.productName}-${i}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            padding: "14px 0",
            borderBottom: "1px solid #f2f2f2",
            fontSize: 14,
          }}
        >
          <div>
            <div>{item.productName}</div>
            <div style={{ marginTop: 4, fontSize: 12, opacity: 0.6 }}>
              {[item.color, item.size].filter(Boolean).join(" / ")} · Qty {item.quantity}
            </div>
          </div>
          <div>{formatCents(item.lineTotal, order.currency)}</div>
        </div>
      ))}
      <div style={{ marginTop: 16, fontSize: 13, opacity: 0.75 }}>
        <Row label="Subtotal" value={formatCents(order.subtotalAmount, order.currency)} />
        <Row label="Shipping" value={formatCents(order.shippingAmount, order.currency)} />
        {order.taxAmount > 0 && (
          <Row label="Tax" value={formatCents(order.taxAmount, order.currency)} />
        )}
        {order.discountAmount > 0 && (
          <Row label="Discount" value={`−${formatCents(order.discountAmount, order.currency)}`} />
        )}
        <Row label="Total" value={formatCents(order.totalAmount, order.currency)} bold />
      </div>
      {order.shippingAddress && (
        <div style={{ marginTop: 24, fontSize: 13, lineHeight: 1.6, opacity: 0.8 }}>
          <div style={{ letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 11, marginBottom: 6 }}>
            Ship to
          </div>
          {order.customerName && <div>{order.customerName}</div>}
          {order.shippingAddress.line1 && <div>{order.shippingAddress.line1}</div>}
          {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
          <div>
            {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode]
              .filter(Boolean)
              .join(", ")}
          </div>
          {order.shippingAddress.country && <div>{order.shippingAddress.country}</div>}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6,
        fontWeight: bold ? 500 : 400,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const heading: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 400,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const body: CSSProperties = {
  marginTop: 14,
  fontSize: 14,
  lineHeight: 1.65,
  opacity: 0.75,
};

const linkStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 28,
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#111",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};
