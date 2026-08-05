import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { withBase } from "@/lib/withBase";

function imageSrc(src: string) {
  return src.startsWith("http") ? src : withBase(src);
}

export default function CartDropdown() {
  const { items, itemCount, isCartOpen, closeCart, lastAddedKey } = useCart();

  if (!isCartOpen) return null;

  const featured =
    items.find((line) => line.key === lastAddedKey) ?? items[items.length - 1] ?? null;

  return (
    <div
      role="dialog"
      aria-label="Cart notification"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.28)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        padding: "72px 16px 16px",
      }}
      onClick={closeCart}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(100%, 360px)",
          background: "#fff",
          border: "1px solid #e8e8e8",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          padding: "20px 18px 18px",
          color: "#111",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13, letterSpacing: "0.02em" }}>
            ✓ Item added to your cart
          </p>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              color: "#666",
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {items.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18, maxHeight: 280, overflowY: "auto" }}>
            {(featured ? [featured, ...items.filter((l) => l.key !== featured.key)] : items).map((line) => (
              <Link
                key={line.key}
                href={`/products/${line.productHandle}`}
                onClick={closeCart}
                style={{ display: "flex", gap: 14, textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={imageSrc(line.image)}
                  alt={line.title}
                  style={{
                    width: 72,
                    height: 96,
                    objectFit: "cover",
                    objectPosition: "center top",
                    background: "#f5f5f5",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600 }}>{line.title}</p>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "#444" }}>{line.colorLabel}</p>
                  {line.size && (
                    <p style={{ margin: "0 0 4px", fontSize: 13, color: "#444" }}>Size: {line.size}</p>
                  )}
                  <p style={{ margin: 0, fontSize: 12, color: "#777" }}>Qty: {line.quantity}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "#666" }}>Your cart is empty.</p>
        )}

        <Link
          href="/cart"
          onClick={closeCart}
          style={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            textAlign: "center",
            padding: "13px 12px",
            border: "1px solid #111",
            color: "#111",
            textDecoration: "none",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          View cart ({itemCount})
        </Link>
        <Link
          href="/checkout"
          onClick={closeCart}
          style={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            textAlign: "center",
            padding: "13px 12px",
            border: "1px solid #e6c84a",
            background: "#f5d76e",
            color: "#111",
            textDecoration: "none",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Check out
        </Link>
        <button
          type="button"
          onClick={closeCart}
          style={{
            display: "block",
            width: "100%",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 13,
            textDecoration: "underline",
            color: "#333",
          }}
        >
          Continue shopping
        </button>

        {items.length > 1 && (
          <p style={{ margin: "14px 0 0", fontSize: 12, color: "#777", textAlign: "center" }}>
            {itemCount} items in cart · {formatPrice(items.reduce((s, l) => s + l.price * l.quantity, 0))}
          </p>
        )}
      </div>
    </div>
  );
}
