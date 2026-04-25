import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import soapsImage from "@assets/IMG_1925-removebg-preview_1777151058658.png";
import intimatesImage from "@assets/intimates_1777140434556.jpg";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || isSearchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, isSearchOpen]);

  const navItems = useMemo(() => ["Collections", "Intimates", "Cuccicare"], []);

  const closeSearch = () => setIsSearchOpen(false);

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#f5f2ee", minHeight: "100vh" }}>
      <section style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
          <img
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
              position: "sticky",
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
                color: isSearchOpen ? "#111" : "#fff",
                transition: "color 0.2s ease",
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
                gap: "56px",
                marginLeft: "24px",
              }}
            >
              {navItems.map((item) => (
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
              <button
                onClick={() => setIsSearchOpen(true)}
                style={{
                  color: "#fff",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  fontFamily: "'Georgia', serif",
                  fontWeight: 400,
                  opacity: 0.85,
                }}
              >
                Search
              </button>
              <a
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
                  (0)
                </a>
            </div>
          </header>
        )}

        {isMobile && (
          <header
            style={{
              position: "sticky",
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
                color: isSearchOpen ? "#111" : "#fff",
                transition: "color 0.2s ease",
                fontSize: "14px",
                letterSpacing: "0.4em",
                fontFamily: "'Georgia', serif",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              CUCCI
            </a>
            <button
              onClick={() => setIsSearchOpen(true)}
              style={{
                color: "#fff",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textDecoration: "none",
                fontFamily: "'Georgia', serif",
                opacity: 0.88,
              }}
            >
              Search
            </button>
          </header>
        )}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", width: "100%" }}>
        <a
          href="/collections"
          style={{
            position: "relative",
            minHeight: isMobile ? "78vw" : "42vw",
            overflow: "hidden",
            textDecoration: "none",
            color: "#5a3b2e",
            background: "#fff",
          }}
        >
          <img
            src={soapsImage}
            alt="Collections"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "calc(50% - 30px) center" }}
          />
          <div style={{ position: "absolute", left: "50%", bottom: 22, transform: "translateX(-50%)", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#5a3b2e" }}>
            Collections
          </div>
        </a>
        <a
          href="/gallery"
          style={{
            position: "relative",
            minHeight: isMobile ? "78vw" : "42vw",
            overflow: "hidden",
            textDecoration: "none",
            color: "#5a3b2e",
            background: "#fff",
          }}
        >
          <img
            src={intimatesImage}
            alt="Intimates"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", left: "50%", bottom: 22, transform: "translateX(-50%)", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#5a3b2e" }}>
            Intimates
          </div>
        </a>
      </section>

      {isMobile && menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#f7dfe6",
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
            <span style={{ width: "100%", display: "block", fontSize: "14px", fontFamily: "'Georgia', serif", color: "#2a2420", letterSpacing: "0.08em" }}>Search</span>
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "28px", alignItems: "center" }}>
            {navItems.map((item) => (
              <a
                key={item}
                href={item === "Collections" ? "/collections" : "#"}
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
              <a key={s} href="#" style={{ color: "#2a2420", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", fontFamily: "'Georgia', serif", opacity: 0.55 }}>
                {s}
              </a>
            ))}
          </div>
        </div>
      )}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSearch}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 90,
              background: "rgba(255,255,255,0.42)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", height: "100%", padding: isMobile ? "22px 18px" : "28px 32px", color: "#111", display: "flex", flexDirection: "column", gap: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                <a href="/" style={{ color: "#111", textDecoration: "none" }}>CUCCI</a>
                <button onClick={closeSearch} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#111", font: "inherit" }}>Close</button>
              </div>
              <div style={{ position: "relative", width: "100%" }}>
                <input aria-label="Search" placeholder="Search" style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: isMobile ? "18px" : "22px", color: "#111", padding: "0 0 12px", borderBottom: "1px solid #111", fontFamily: "'Georgia', serif" }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
