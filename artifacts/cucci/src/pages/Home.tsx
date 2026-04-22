import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const gifRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navItems = ["Collections", "Sweetsuits", "Intimates", "Cuccicare"];

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#f5f2ee", minHeight: "100vh" }}>
      <section style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
        <img
          ref={gifRef}
          src="/hero.gif"
          alt="CUCCI background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,8,6,0.18)",
            zIndex: 1,
          }}
        />

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
              padding: "36px 48px",
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
            <nav
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                gap: "48px",
              }}
            >
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    color: "#fff",
                    fontSize: "13px",
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                    fontFamily: "'Georgia', serif",
                    fontWeight: 400,
                    transition: "opacity 0.2s",
                    opacity: 0.92,
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.opacity = "0.55")}
                  onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.opacity = "0.92")}
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
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.opacity = "0.45")}
                  onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.opacity = "0.85")}
                >
                  {item}
                </a>
              ))}
            </div>
          </header>
        )}

        {isMobile && (
          <header
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 24px",
            }}
          >
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
              aria-label="Open menu"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    width: "22px",
                    height: "1px",
                    background: "#fff",
                  }}
                />
              ))}
            </button>
            <a
              href="/"
              style={{
                color: "#fff",
                fontSize: "14px",
                letterSpacing: "0.4em",
                fontFamily: "'Georgia', serif",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              CUCCI
            </a>
            <a
              href="#"
              style={{
                color: "#fff",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textDecoration: "none",
                fontFamily: "'Georgia', serif",
                opacity: 0.88,
              }}
            >
              (0)
            </a>
          </header>
        )}
      </section>

      {isMobile && menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#f5f2ee",
            display: "flex",
            flexDirection: "column",
            padding: "28px 28px 40px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", marginBottom: "36px" }}>
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: "#2a2420",
                fontFamily: "'Georgia', serif",
                lineHeight: 1,
                padding: 0,
              }}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <div style={{ marginBottom: "40px", borderBottom: "1px solid rgba(42,36,32,0.2)", paddingBottom: "12px" }}>
            <input
              type="search"
              placeholder="Search"
              style={{
                width: "100%",
                background: "none",
                border: "none",
                outline: "none",
                fontSize: "14px",
                fontFamily: "'Georgia', serif",
                color: "#2a2420",
                letterSpacing: "0.08em",
              }}
            />
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "28px", alignItems: "center" }}>
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                onClick={() => setMenuOpen(false)}
                style={{
                  color: "#2a2420",
                  fontSize: "22px",
                  letterSpacing: "0.12em",
                  textDecoration: "none",
                  fontFamily: "'Georgia', serif",
                  fontWeight: 400,
                }}
              >
                {item}
              </a>
            ))}
          </nav>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
            {["Instagram", "Vimeo", "TikTok"].map((s) => (
              <a
                key={s}
                href="#"
                style={{
                  color: "#2a2420",
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontFamily: "'Georgia', serif",
                  opacity: 0.55,
                }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
