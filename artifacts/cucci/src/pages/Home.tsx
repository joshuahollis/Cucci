import { useEffect, useState } from "react";

const navItems = ["Woman", "Man", "Projects and Collaborations", "Collections"];

function SearchOverlay({ open, onClose, mobile }: { open: boolean; onClose: () => void; mobile: boolean }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#fff", color: "#111", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px", padding: mobile ? "20px 20px 0" : "28px 32px 0" }}>
        <a href="#" style={{ fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", color: "#111", fontFamily: "Arial, Helvetica, sans-serif" }}>Create Account</a>
        <button onClick={onClose} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#111", fontFamily: "Arial, Helvetica, sans-serif" }}>Close (X)</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: mobile ? "0 20px" : "0 64px" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "100%", margin: "0 auto 34px" }}>
          <div style={{ height: 1, width: "100%", background: "rgba(17,17,17,0.72)" }} />
          <div style={{ position: "absolute", top: -7, left: `calc(${Math.min(96, 18 + query.length * 6)}% - 8px)`, width: 16, height: 16, borderRadius: 999, background: "#111", transition: "left 0.15s ease" }} />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "text" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: mobile ? "16px" : "18px", fontFamily: "Arial, Helvetica, sans-serif", textTransform: "uppercase", fontSize: mobile ? "24px" : "34px", letterSpacing: "0.04em" }}>
          <a href="#" style={{ color: "#111", textDecoration: "none" }}>Woman &gt;</a>
          <a href="#" style={{ color: "#111", textDecoration: "none" }}>Man &gt;</a>
          <a href="#" style={{ color: "#111", textDecoration: "none" }}>Projects and Collaborations</a>
          <a href="#" style={{ color: "#111", textDecoration: "none" }}>Collections</a>
          {query ? <a href="#" style={{ color: "#111", textDecoration: "underline", fontSize: mobile ? "12px" : "13px", marginTop: mobile ? "10px" : "12px", letterSpacing: "0.12em" }}>See all results</a> : null}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <img src="/hero.gif" alt="Background" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.92) contrast(0.92) brightness(0.72)", transform: "scale(1.02)" }} />
      </div>
      <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.08)", zIndex: 1 }} />
      <header style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: isMobile ? "18px 16px" : "22px 28px", gap: "16px", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: "12px" }}>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "10px 14px" : "22px", maxWidth: "72%" }}>
          {navItems.map((item) => <a key={item} href="#" style={{ color: "#fff", textDecoration: "none" }}>{item}</a>)}
        </nav>
        <div style={{ display: "flex", gap: isMobile ? "12px" : "24px", alignItems: "center", whiteSpace: "nowrap" }}>
          <button onClick={() => setSearchOpen(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#fff", font: "inherit", letterSpacing: "inherit", textTransform: "inherit" }}>SEARCH</button>
          <a href="#" style={{ color: "#fff", textDecoration: "none" }}>LOG IN</a>
          <a href="#" style={{ color: "#fff", textDecoration: "none" }}>CART (0)</a>
        </div>
      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} mobile={isMobile} />
    </div>
  );
}
