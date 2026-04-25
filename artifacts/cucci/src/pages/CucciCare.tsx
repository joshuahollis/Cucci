import { useEffect, useState } from "react";

const navItems = ["Collections", "Intimates", "Cucci Care"];

export default function CucciCare() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Georgia', serif" }}>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: isMobile ? "24px 24px" : "36px 64px 36px 48px",
        }}
      >
        <a
          href="/"
          style={{
            writingMode: isMobile ? "horizontal-tb" : "vertical-rl",
            textOrientation: "mixed",
            transform: isMobile ? "none" : "rotate(180deg)",
            color: "#fff",
            fontSize: isMobile ? "14px" : "13px",
            letterSpacing: isMobile ? "0.4em" : "0.3em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          CUCCI
        </a>
        <nav style={{ display: "flex", gap: isMobile ? "12px" : "56px", flexWrap: "wrap", justifyContent: "center" }}>
          {navItems.map((item) => (
            <a key={item} href={item === "Cucci Care" ? "/cucci-care" : "#"} style={{ color: "#fff", textDecoration: "none", fontSize: isMobile ? "12px" : "13px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {item}
            </a>
          ))}
        </nav>
      </header>
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px 48px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", textAlign: "center" }}>
          <a href="#" style={{ color: "#fff", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.18em" }}>Collections</a>
          <a href="#" style={{ color: "#fff", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.18em" }}>Intimates</a>
          <a href="#" style={{ color: "#fff", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.18em" }}>Cucci Care</a>
        </div>
      </main>
    </div>
  );
}