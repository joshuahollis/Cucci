import { withBase } from "@/lib/withBase";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f2ee",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#888" }}>
          404
        </p>
        <h1 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 400, color: "#1a1a1a" }}>
          Page not found
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, lineHeight: 1.6, color: "#555" }}>
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <a
          href={withBase("/")}
          style={{
            color: "#1a1a1a",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "underline",
          }}
        >
          Back home
        </a>
      </div>
    </div>
  );
}
