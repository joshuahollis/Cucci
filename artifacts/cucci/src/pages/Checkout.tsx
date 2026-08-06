import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { createCheckoutSession, type InventoryChangedLine } from "@/lib/api";
import { hasStripePublishableKey, stripePromise } from "@/lib/stripe";
import { withBase } from "@/lib/withBase";

const ORDER_ID_KEY = "cucci_checkout_order_id";

function imageSrc(src: string) {
  return src.startsWith("http") ? src : withBase(src);
}

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, closeCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [inventoryLines, setInventoryLines] = useState<InventoryChangedLine[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    closeCart();
  }, [closeCart]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const displaySubtotal = items.reduce((n, l) => n + l.price * l.quantity, 0);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    setInventoryLines([]);
    const payload = items.map((l) => ({
      variantId: String(l.variantId),
      quantity: l.quantity,
    }));
    if (payload.length === 0) {
      throw new Error("Your bag is empty.");
    }
    let resumeOrderId: string | null = null;
    try {
      resumeOrderId = sessionStorage.getItem(ORDER_ID_KEY);
    } catch {
      resumeOrderId = null;
    }
    try {
      const session = await createCheckoutSession(payload, resumeOrderId);
      try {
        sessionStorage.setItem(ORDER_ID_KEY, session.orderId);
      } catch {
        /* ignore */
      }
      return session.clientSecret;
    } catch (err) {
      const e = err as Error & { code?: string; lines?: InventoryChangedLine[] };
      if (e.code === "inventory_changed" && e.lines) {
        setInventoryLines(e.lines);
        for (const line of e.lines) {
          const match = items.find((i) => String(i.variantId) === line.variantId);
          if (!match) continue;
          if (
            line.reason === "sold_out" ||
            line.reason === "missing" ||
            line.reason === "inactive"
          ) {
            removeItem(match.key);
          } else if (
            line.reason === "insufficient" &&
            typeof line.available === "number"
          ) {
            if (line.available <= 0) removeItem(match.key);
            else updateQuantity(match.key, line.available);
          }
        }
      }
      setError(e.message || "Unable to start checkout.");
      throw e;
    }
  }, [items, removeItem, updateQuantity, retryToken]);

  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  if (!hasStripePublishableKey() || !stripePromise) {
    return (
      <Shell isMobile={isMobile}>
        <Message
          title="Checkout unavailable"
          body="Stripe publishable key is not configured yet. Add VITE_STRIPE_PUBLISHABLE_KEY after following STRIPE_SETUP.md."
        />
      </Shell>
    );
  }

  if (items.length === 0) {
    return (
      <Shell isMobile={isMobile}>
        <Message
          title="Your bag is empty"
          body="Add a size from Collections before checking out."
          actionHref="/collections"
          actionLabel="Shop collections"
        />
      </Shell>
    );
  }

  return (
    <Shell isMobile={isMobile}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "minmax(280px, 380px) 1fr",
          gap: isMobile ? 28 : 48,
          alignItems: "start",
        }}
      >
        <aside>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Checkout
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 13, opacity: 0.6, lineHeight: 1.5 }}>
            Payment details are collected securely by Stripe. Card data never touches Cucci
            servers.
          </p>

          <div style={{ borderTop: "1px solid #eee" }}>
            {items.map((line) => (
              <div
                key={line.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "64px 1fr auto",
                  gap: 12,
                  padding: "16px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 80,
                    background: "#f6f6f6",
                    overflow: "hidden",
                  }}
                >
                  {line.image ? (
                    <img
                      src={imageSrc(line.image)}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : null}
                </div>
                <div>
                  <div style={{ fontSize: 14 }}>{line.title}</div>
                  <div style={{ marginTop: 4, fontSize: 12, opacity: 0.6 }}>
                    {[line.colorLabel, line.size].filter(Boolean).join(" / ")} · Qty{" "}
                    {line.quantity}
                  </div>
                </div>
                <div style={{ fontSize: 13 }}>
                  {formatPrice(line.price * line.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 16,
              fontSize: 13,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <span>Subtotal</span>
            <span>{formatPrice(displaySubtotal)}</span>
          </div>
          <p style={{ marginTop: 8, fontSize: 12, opacity: 0.55 }}>
            Shipping ($8 standard US) and any tax are finalized in Stripe Checkout.
          </p>

          <Link
            href="/collections"
            style={{
              display: "inline-block",
              marginTop: 20,
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#111",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            ← Back to shopping
          </Link>

          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14 }}>
            {[
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
              ["Shipping", "/shipping"],
              ["Returns", "/returns"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#666",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {inventoryLines.length > 0 && (
            <div
              role="alert"
              style={{
                marginTop: 20,
                padding: 14,
                background: "#faf6f0",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Availability changed for one or more items. Your bag was updated — review and
              retry.
            </div>
          )}

          {error && (
            <div role="alert" style={{ marginTop: 16, fontSize: 13, color: "#8a1f1f" }}>
              {error}{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setRetryToken((n) => n + 1);
                }}
                style={{
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer",
                  color: "inherit",
                  fontFamily: "inherit",
                }}
              >
                Retry
              </button>
            </div>
          )}
        </aside>

        <div style={{ minHeight: 480 }}>
          {!error && (
            <EmbeddedCheckoutProvider
              key={retryToken}
              stripe={stripePromise}
              options={options}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children, isMobile }: { children: ReactNode; isMobile: boolean }) {
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "20px" : "28px 48px",
          borderBottom: "1px solid #eee",
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
        <Link
          href="/collections"
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#111",
            textDecoration: "none",
            opacity: 0.7,
          }}
        >
          Continue shopping
        </Link>
      </header>
      <main
        style={{
          padding: isMobile ? "28px 20px 60px" : "40px 48px 80px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function Message({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div style={{ maxWidth: 420, paddingTop: 40 }}>
      <h1
        style={{
          fontSize: 18,
          fontWeight: 400,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.7 }}>{body}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          style={{
            display: "inline-block",
            marginTop: 16,
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#111",
          }}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
