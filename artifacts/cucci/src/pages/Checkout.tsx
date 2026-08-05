import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "wouter";
import CartButton from "@/components/CartButton";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { withBase } from "@/lib/withBase";

function imageSrc(src: string) {
  return src.startsWith("http") ? src : withBase(src);
}

type CheckoutForm = {
  contact: string;
  emailOffers: boolean;
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

const initialForm: CheckoutForm = {
  contact: "",
  emailOffers: true,
  country: "United States",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
};

export default function Checkout() {
  const { items, itemCount, subtotal } = useCart();
  const [isMobile, setIsMobile] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const shippingEstimate = useMemo(() => (subtotal >= 100 || subtotal === 0 ? 0 : 8), [subtotal]);
  const total = subtotal + shippingEstimate;

  const setField = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: string[] = [];
    if (!form.contact.trim()) nextErrors.push("Contact email or phone is required.");
    if (!form.lastName.trim()) nextErrors.push("Last name is required.");
    if (!form.address.trim()) nextErrors.push("Address is required.");
    if (!form.city.trim()) nextErrors.push("City is required.");
    if (!form.state.trim()) nextErrors.push("State is required.");
    if (!form.zip.trim()) nextErrors.push("ZIP code is required.");
    if (items.length === 0) nextErrors.push("Your cart is empty.");
    setErrors(nextErrors);
    if (nextErrors.length === 0) {
      setSubmitted(true);
    }
  };

  if (items.length === 0 && !submitted) {
    return (
      <div
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          minHeight: "100vh",
          background: "#fff",
          padding: 40,
          textAlign: "center",
        }}
      >
        <a
          href={withBase("/")}
          style={{ color: "#111", textDecoration: "none", letterSpacing: "0.3em", textTransform: "uppercase" }}
        >
          cucci
        </a>
        <p style={{ margin: "40px 0 20px", color: "#555" }}>Your cart is empty.</p>
        <Link href="/collections" style={{ color: "#111", textDecoration: "underline" }}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        background: "#fff",
        minHeight: "100vh",
        color: "#1a1a1a",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "18px 16px" : "22px 40px",
          borderBottom: "1px solid #eaeaea",
        }}
      >
        <a
          href={withBase("/")}
          style={{
            color: "#111",
            fontSize: 22,
            fontWeight: 500,
            textDecoration: "none",
            letterSpacing: "0.02em",
          }}
        >
          cucci
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/collections"
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#444",
              textDecoration: "none",
            }}
          >
            Collections
          </Link>
          <CartButton color="#2563eb" />
        </div>
      </header>

      <button
        type="button"
        onClick={() => setSummaryOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px",
          border: "none",
          borderBottom: "1px solid #eaeaea",
          background: "#fafafa",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 14,
          color: "#2563eb",
        }}
      >
        <span>
          Order summary {summaryOpen ? "▴" : "▾"} · {itemCount}{" "}
          {itemCount === 1 ? "item" : "items"}
        </span>
        <span style={{ color: "#111", fontWeight: 600 }}>{formatPrice(total)}</span>
      </button>

      {summaryOpen && (
        <div
          style={{
            padding: isMobile ? "16px" : "20px 40px",
            borderBottom: "1px solid #eaeaea",
            background: "#fafafa",
          }}
        >
          {items.map((line) => (
            <div
              key={line.key}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={imageSrc(line.image)}
                  alt={line.title}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    background: "#fff",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    minWidth: 20,
                    height: 20,
                    borderRadius: 999,
                    background: "#666",
                    color: "#fff",
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 5px",
                  }}
                >
                  {line.quantity}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 500 }}>{line.title}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                  {line.colorLabel}
                  {line.size ? ` / ${line.size}` : ""}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: 14 }}>{formatPrice(line.price * line.quantity)}</p>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 12, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Shipping</span>
              <span>{shippingEstimate === 0 ? "Free" : formatPrice(shippingEstimate)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 16 }}>
              <span>Total</span>
              <span>USD {formatPrice(total)}</span>
            </div>
          </div>
        </div>
      )}

      <main
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: isMobile ? "24px 16px 80px" : "32px 24px 100px",
        }}
      >
        {submitted ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <h1 style={{ fontSize: 28, fontWeight: 500, margin: "0 0 12px" }}>Information saved</h1>
            <p style={{ margin: "0 0 24px", color: "#555", lineHeight: 1.6 }}>
              Checkout details are ready. Stripe payment integration will process this order next.
            </p>
            <Link href="/collections" style={{ color: "#2563eb", textDecoration: "underline" }}>
              Return to collections
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <section style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Contact</h2>
                <span style={{ fontSize: 13, color: "#666" }}>Sign in</span>
              </div>
              <Field
                label="Email or mobile phone number"
                value={form.contact}
                onChange={(v) => setField("contact", v)}
                autoComplete="email"
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 12,
                  fontSize: 14,
                  color: "#333",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.emailOffers}
                  onChange={(e) => setField("emailOffers", e.target.checked)}
                />
                Email me with news and offers
              </label>
            </section>

            <section style={{ marginBottom: 28 }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 500 }}>Delivery</h2>
              <Field
                label="Country/Region"
                value={form.country}
                onChange={(v) => setField("country", v)}
                as="select"
                options={["United States", "Canada", "United Kingdom"]}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <Field
                  label="First name (optional)"
                  value={form.firstName}
                  onChange={(v) => setField("firstName", v)}
                  autoComplete="given-name"
                />
                <Field
                  label="Last name"
                  value={form.lastName}
                  onChange={(v) => setField("lastName", v)}
                  autoComplete="family-name"
                />
              </div>
              <div style={{ marginTop: 10 }}>
                <Field
                  label="Address"
                  value={form.address}
                  onChange={(v) => setField("address", v)}
                  autoComplete="street-address"
                />
              </div>
              <div style={{ marginTop: 10 }}>
                <Field
                  label="Apartment, suite, etc. (optional)"
                  value={form.apartment}
                  onChange={(v) => setField("apartment", v)}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <Field label="City" value={form.city} onChange={(v) => setField("city", v)} autoComplete="address-level2" />
                <Field label="State" value={form.state} onChange={(v) => setField("state", v)} autoComplete="address-level1" />
                <Field label="ZIP code" value={form.zip} onChange={(v) => setField("zip", v)} autoComplete="postal-code" />
              </div>
              <div style={{ marginTop: 10 }}>
                <Field
                  label="Phone (optional)"
                  value={form.phone}
                  onChange={(v) => setField("phone", v)}
                  autoComplete="tel"
                />
              </div>
            </section>

            {errors.length > 0 && (
              <ul style={{ margin: "0 0 16px", paddingLeft: 18, color: "#a33", fontSize: 13 }}>
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "16px 18px",
                border: "none",
                borderRadius: 8,
                background: "#2563eb",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Continue to payment
            </button>
            <p style={{ margin: "14px 0 0", fontSize: 12, color: "#777", textAlign: "center" }}>
              Stripe payment will be connected on the next step.
            </p>
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <Link href="/cart" style={{ color: "#2563eb", fontSize: 13, textDecoration: "none" }}>
                ← Return to cart
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  autoComplete,
  as = "input",
  options = [],
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  as?: "input" | "select";
  options?: string[];
}) {
  const shared = {
    value,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange(e.target.value),
    style: {
      width: "100%",
      boxSizing: "border-box" as const,
      padding: "14px 12px",
      border: "1px solid #c9c9c9",
      borderRadius: 8,
      fontSize: 14,
      fontFamily: "inherit",
      background: "#fff",
      color: "#111",
    },
  };

  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        {label}
      </span>
      {as === "select" ? (
        <select {...shared} aria-label={label}>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input {...shared} placeholder={label} autoComplete={autoComplete} aria-label={label} />
      )}
    </label>
  );
}
