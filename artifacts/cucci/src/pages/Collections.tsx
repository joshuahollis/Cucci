import { useEffect, useRef, useState } from "react";

export default function Collections() {
  const [isMobile, setIsMobile] = useState(false);
  const gifRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#f5f2ee", minHeight: "100vh" }}>
      <section style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
        <img
          ref={gifRef}
          src="/collections.gif"
          alt="Collections background"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,6,0.18)", zIndex: 1 }} />

        {!isMobile && (
          <header
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "flex-start",
              padding: "36px 64px 36px 48px",
            }}
          >
            <a
              href="/"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                color: "#fff",
                fontSize: "13px",
                letterSpacing: "0.3em",
                fontFamily: "'Georgia', serif",
                fontWeight: 400,
                textTransform: "uppercase",
                userSelect: "none",
                marginTop: 4,
                textDecoration: "none",
              }}
            >
              CUCCI
            </a>
            <nav style={{ flex: 1, display: "flex", justifyContent: "center", gap: "56px", marginLeft: "24px" }}>
              {["Collections", "Sweetsuits", "Intimates", "Cuccicare"].map((item) => (
                <a
                  key={item}
                  href={item === "Collections" ? "/collections" : "#"}
                  style={{
                    color: "#fff",
                    fontSize: "13px",
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                    fontFamily: "'Georgia', serif",
                    fontWeight: 400,
                    opacity: 0.92,
                  }}
                >
                  {item}
                </a>
              ))}
            </nav>
            <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
              {["Search", "Log In", "(0)"].map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    color: "#fff",
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textDecoration: "none",
                    textTransform: "uppercase",
                    fontFamily: "'Georgia', serif",
                    fontWeight: 400,
                    opacity: 0.85,
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
          </header>
        )}
      </section>

      <section style={{ display: "flex", width: "100%", flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ flex: 1, minHeight: isMobile ? "50vw" : "34vw", background: "#e9e4dc" }} />
        <div style={{ flex: 1, minHeight: isMobile ? "50vw" : "34vw", background: "#ddd7cf" }} />
      </section>
    </div>
  );
}
