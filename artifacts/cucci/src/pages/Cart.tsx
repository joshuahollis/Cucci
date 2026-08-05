import { useEffect, useState } from "react";
import { Link } from "wouter";
import CartButton from "@/components/CartButton";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { withBase } from "@/lib/withBase";

function imageSrc(src: string) {
  return src.startsWith("http") ? src : withBase(src);
}

export default function Cart() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "20px" : "28px 48px",
          background: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid #eee",
        }}
      >
        <a
          href={withBase("/")}
          style={{
            color: "#111",
            fontSize: isMobile ? 14 : 13,
            letterSpacing: isMobile ? "0.4em" : "0.3em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          CUCCI
        </a>
        <nav
          style={{
            display: isMobile ? "none" : "flex",
            gap: 40,
            fontSize: 13,
            letterSpacing: "0.1em",
          }}
        >
          <Link href="/collections" style={{ color: "#111", textDecoration: "none" }}>
            Collections
          </Link>
          <Link href="/intimates" style={{ color: "#111", textDecoration: "none", opacity: 0.85 }}>
            Intimates
          </Link>
          <Link href="/cuccicare" style={{ color: "#111", textDecoration: "none", opacity: 0.85 }}>
            Cucci Care
          </Link>
        </nav>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link
            href="/collections"
            style={{
              color: "#111",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              opacity: 0.8,
            }}
          >
            Shop
          </Link>
          <CartButton />
        </div>
      </header>

      <main
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: isMobile ? "28px 16px 80px" : "48px 40px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 28,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, fontSize: isMobile ? 28 : 36, fontWeight: 400 }}>Your cart</h1>
          <Link
            href="/collections"
            style={{ color: "#333", fontSize: 13, textDecoration: "underline" }}
          >
            Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <p style={{ margin: "0 0 20px", fontSize: 15, color: "#555" }}>Your cart is empty.</p>
            <Link
              href="/collections"
              style={{
                display: "inline-block",
                padding: "12px 22px",
                border: "1px solid #111",
                color: "#111",
                textDecoration: "none",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Browse collections
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                display: isMobile ? "none" : "grid",
                gridTemplateColumns: "1fr 120px 120px",
                gap: 16,
                paddingBottom: 10,
                borderBottom: "1px solid #e5e5e5",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#777",
              }}
            >
              <span>Product</span>
              <span style={{ textAlign: "center" }}>Quantity</span>
              <span style={{ textAlign: "right" }}>Total</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {items.map((line) => (
                <div
                  key={line.key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "88px 1fr" : "1fr 120px 120px",
                    gap: isMobile ? 14 : 16,
                    padding: "22px 0",
                    borderBottom: "1px solid #eee",
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      gridColumn: isMobile ? "1 / -1" : undefined,
                    }}
                  >
                    <Link href={`/products/${line.productHandle}`}>
                      <img
                        src={imageSrc(line.image)}
                        alt={line.title}
                        style={{
                          width: isMobile ? 88 : 100,
                          height: isMobile ? 118 : 130,
                          objectFit: "cover",
                          objectPosition: "center top",
                          background: "#f5f5f5",
                          display: "block",
                        }}
                      />
                    </Link>
                    <div style={{ flex: 1 }}>
                      <Link
                        href={`/products/${line.productHandle}`}
                        style={{ color: "#111", textDecoration: "none" }}
                      >
                        <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>
                          {line.title}
                        </p>
                      </Link>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#555" }}>
                        {formatPrice(line.price)}
                      </p>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#555" }}>
                        {line.colorLabel}
                      </p>
                      {line.size && (
                        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#555" }}>
                          Size: {line.size}
                        </p>
                      )}
                      {isMobile && (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <QuantityControl
                            quantity={line.quantity}
                            onChange={(q) => updateQuantity(line.key, q)}
                          />
                          <button
                            type="button"
                            aria-label="Remove item"
                            onClick={() => removeItem(line.key)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#777",
                              fontSize: 16,
                              padding: 4,
                            }}
                          >
                            ⌫
                          </button>
                          <span style={{ marginLeft: "auto", fontSize: 14 }}>
                            {formatPrice(line.price * line.quantity)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isMobile && (
                    <>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
                        <QuantityControl
                          quantity={line.quantity}
                          onChange={(q) => updateQuantity(line.key, q)}
                        />
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => removeItem(line.key)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#777",
                            fontSize: 16,
                            padding: 4,
                          }}
                        >
                          ⌫
                        </button>
                      </div>
                      <div style={{ textAlign: "right", fontSize: 14, paddingTop: 8 }}>
                        {formatPrice(line.price * line.quantity)}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                alignItems: isMobile ? "stretch" : "flex-end",
                gap: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: 16 }}>
                Estimated total{" "}
                <strong style={{ fontWeight: 600 }}>{formatPrice(subtotal)}</strong>
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#777" }}>
                Taxes, discounts and shipping calculated at checkout. {itemCount}{" "}
                {itemCount === 1 ? "item" : "items"} in cart.
              </p>
              <Link
                href="/checkout"
                style={{
                  display: "block",
                  width: isMobile ? "100%" : 280,
                  boxSizing: "border-box",
                  textAlign: "center",
                  padding: "14px 16px",
                  background: "#f5d76e",
                  border: "1px solid #e6c84a",
                  color: "#111",
                  textDecoration: "none",
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginTop: 8,
                }}
              >
                Check out
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function QuantityControl({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (q: number) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid #ccc",
        height: 36,
      }}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(quantity - 1)}
        style={{
          width: 34,
          height: "100%",
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: 16,
          fontFamily: "inherit",
        }}
      >
        −
      </button>
      <span style={{ minWidth: 28, textAlign: "center", fontSize: 14 }}>{quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(quantity + 1)}
        style={{
          width: 34,
          height: "100%",
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: 16,
          fontFamily: "inherit",
        }}
      >
        +
      </button>
    </div>
  );
}
