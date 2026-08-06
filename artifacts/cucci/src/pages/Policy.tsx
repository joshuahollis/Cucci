import { Link } from "wouter";
import { withBase } from "@/lib/withBase";

const copy: Record<string, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "Cucci collects only the information needed to fulfill your order: contact details, shipping address, and payment confirmation from Stripe.",
      "Payment card data is collected and processed by Stripe. Cucci never stores full card numbers on our servers.",
      "We do not sell personal information. Order data is retained as needed for fulfillment, returns, and legal obligations.",
      "Questions: contact the email listed on ilovecucci.com.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "By placing an order you agree that prices, taxes, and shipping are calculated at checkout by our secure payment provider.",
      "All sales of limited inventory pieces are subject to availability at the time payment is confirmed.",
      "Cucci may cancel orders that cannot be fulfilled and will issue a refund through Stripe.",
    ],
  },
  shipping: {
    title: "Shipping Policy",
    body: [
      "We currently ship within the United States.",
      "Standard shipping is a flat $8 rate unless otherwise stated at checkout.",
      "Orders typically ship within a few business days after payment confirmation. Tracking is provided when available.",
    ],
  },
  returns: {
    title: "Returns & Refunds",
    body: [
      "Because inventory is limited, please review size charts carefully before purchasing.",
      "Eligible returns must be unused and in original condition. Contact us with your order number to start a return.",
      "Approved refunds are issued to the original payment method via Stripe.",
    ],
  },
};

export default function PolicyPage({ kind }: { kind: keyof typeof copy }) {
  const page = copy[kind];
  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        background: "#fff",
        minHeight: "100vh",
        color: "#1a1a1a",
      }}
    >
      <header style={{ padding: "28px 24px", borderBottom: "1px solid #eee" }}>
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
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 400,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {page.title}
        </h1>
        {page.body.map((p) => (
          <p key={p.slice(0, 24)} style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.8 }}>
            {p}
          </p>
        ))}
        <Link
          href="/checkout"
          style={{
            display: "inline-block",
            marginTop: 24,
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#111",
          }}
        >
          ← Back to checkout
        </Link>
      </main>
    </div>
  );
}
