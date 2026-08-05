import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { collectionProducts, formatPrice, getProductByHandle } from "@/data/products";
import { withBase } from "@/lib/withBase";

export default function Collections() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
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

  const navItems = useMemo(() => ["Collections", "Intimates", "Cucci Care"], []);

  const closeSearch = () => setIsSearchOpen(false);

  const columns = isMobile ? 2 : isTablet ? 3 : 4;

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#fff", minHeight: "100vh" }}>
      <section style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
        <img
          src={withBase("/collections.gif")}
          alt="Collections background"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,6,0.18)", zIndex: 1 }} />

        {!isMobile && (
          <header
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "flex-start",
              padding: "36px 64px 36px 48px",
              pointerEvents: "auto",
            }}
          >
            <a
              href={withBase("/")}
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
            <nav style={{ flex: 1, display: "flex", justifyContent: "center", gap: "56px", marginLeft: "24px" }}>
              {navItems.map((item) => (
                <a
                  key={item}
                  href={item === "Collections" ? withBase("/collections") : item === "Intimates" ? withBase("/intimates") : item === "Cucci Care" ? withBase("/cuccicare") : "#"}
                  style={{
                    color: "#fff",
                    fontSize: "13px",
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                    fontFamily: "'Georgia', serif",
                    fontWeight: 400,
                    opacity: item === "Collections" ? 0.55 : 0.92,
                  }}
                >
                  {item}
                </a>
              ))}
            </nav>
            <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
              <button onClick={() => setIsSearchOpen(true)} style={{ color: "#fff", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "11px", letterSpacing: "0.18em", textDecoration: "none", textTransform: "uppercase", fontFamily: "'Georgia', serif", fontWeight: 400, opacity: 0.85 }}>Search</button>
              <span style={{ color: "#fff", fontSize: "11px", letterSpacing: "0.18em", textDecoration: "none", textTransform: "uppercase", fontFamily: "'Georgia', serif", fontWeight: 400, opacity: 0.85 }}>(0)</span>
            </div>
          </header>
        )}

        {isMobile && (
          <header
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 24px",
              pointerEvents: "auto",
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
              href={withBase("/")}
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

      <section
        style={{
          backgroundColor: "#ffffff",
          padding: isMobile ? "48px 16px 80px" : "64px 40px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: isMobile ? 28 : 40,
            maxWidth: 1600,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? 14 : 15,
              fontWeight: 400,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#1a1a1a",
            }}
          >
            Collections
          </h1>
          <span style={{ fontSize: 12, letterSpacing: "0.06em", color: "#666" }}>
            {collectionProducts.length} products
          </span>
        </div>

        <div
          style={{
            maxWidth: 1600,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: isMobile ? "28px 12px" : "48px 20px",
          }}
        >
          {collectionProducts.map((product) => {
            const related =
              product.relatedHandles
                ?.map((h) => getProductByHandle(h))
                .filter(Boolean)
                .filter((p, i, arr) => arr.findIndex((x) => x!.handle === p!.handle) === i) ?? [];
            const colorCount = related.length > 1 ? related.length : 0;
            const hoverImage =
              hoveredHandle === product.handle && product.images[1]
                ? product.images[1]
                : product.images[0];

            return (
              <Link
                key={product.handle}
                href={`/products/${product.handle}`}
                onMouseEnter={() => setHoveredHandle(product.handle)}
                onMouseLeave={() => setHoveredHandle(null)}
                style={{
                  textDecoration: "none",
                  color: "#1a1a1a",
                  display: "block",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "3 / 4",
                    overflow: "hidden",
                    background: "#f4f4f4",
                    marginBottom: 14,
                  }}
                >
                  <img
                    src={hoverImage}
                    alt={`${product.title} — ${product.colorLabel}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      display: "block",
                      transition: "opacity 0.35s ease",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", textAlign: "center" }}>
                  <span
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      letterSpacing: "0.02em",
                      fontWeight: 400,
                      lineHeight: 1.35,
                    }}
                  >
                    {product.title}
                  </span>
                  <span
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: "#444",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {colorCount > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#888",
                        letterSpacing: "0.04em",
                        marginTop: 2,
                      }}
                    >
                      {colorCount} colors
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {isMobile && menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#f7dfe6", display: "flex", flexDirection: "column", padding: "28px 28px 40px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", marginBottom: "36px" }}>
            <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#2a2420", fontFamily: "'Georgia', serif", lineHeight: 1, padding: 0 }} aria-label="Close menu">×</button>
          </div>
          <div style={{ marginBottom: "40px", borderBottom: "1px solid rgba(42,36,32,0.2)", paddingBottom: "12px" }}>
            <span style={{ width: "100%", display: "block", fontSize: "14px", fontFamily: "'Georgia', serif", color: "#2a2420", letterSpacing: "0.08em" }}>Search</span>
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "28px", alignItems: "center" }}>
            {navItems.map((item) => (
              <a key={item} href={item === "Collections" ? withBase("/collections") : item === "Intimates" ? withBase("/intimates") : item === "Cucci Care" ? withBase("/cuccicare") : "#"} onClick={() => setMenuOpen(false)} style={{ color: "#2a2420", fontSize: "22px", letterSpacing: "0.12em", textDecoration: "none", fontFamily: "'Georgia', serif", fontWeight: 400 }}>
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
                <a href={withBase("/")} style={{ color: "#111", textDecoration: "none" }}>CUCCI</a>
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
