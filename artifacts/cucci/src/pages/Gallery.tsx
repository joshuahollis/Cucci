import { useEffect, useState } from "react";

const images = [
  "/gallery/blackcucci_1777077432211.jpg",
  "/gallery/cucci_1777077432222.png",
  "/gallery/cuccicutoff_1777077432223.jpg",
  "/gallery/cuccisoap_1777077432224.jpg",
  "/gallery/cursivecucci_1777077432225.png",
  "/gallery/ilovecucci_1777077432225.PNG",
  "/gallery/IMG_0466_1777077432226.png",
  "/gallery/IMG_1360_1777077432227.jpg",
  "/gallery/IMG_1361_1777077432227.jpg"
];

export default function Gallery() {
  const [isMobile, setIsMobile] = useState(false);

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
          src="/gallery/ilovecucci_1777077432225.PNG"
          alt="CUCCI gallery hero"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,6,0.18)", zIndex: 1 }} />
        {!isMobile && (
          <header style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "flex-start", padding: "36px 64px 36px 48px" }}>
            <a href="/" style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)", color: "#fff", fontSize: "13px", letterSpacing: "0.3em", fontFamily: "'Georgia', serif", fontWeight: 400, textTransform: "uppercase", userSelect: "none", marginTop: 4, textDecoration: "none" }}>CUCCI</a>
            <nav style={{ flex: 1, display: "flex", justifyContent: "center", gap: "56px", marginLeft: "24px" }}>
              {["Collections", "Intimates", "Cuccicare"].map((item) => (
                <a key={item} href={item === "Collections" ? "/collections" : item === "Intimates" ? "/gallery" : "#"} style={{ color: "#fff", fontSize: "13px", letterSpacing: "0.1em", textDecoration: "none", fontFamily: "'Georgia', serif", fontWeight: 400, opacity: item === "Intimates" ? 0.55 : 0.92 }}>
                  {item}
                </a>
              ))}
            </nav>
            <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
              {["Search", "(0)"].map((item) => (
                <a key={item} href="#" style={{ color: "#fff", fontSize: "11px", letterSpacing: "0.18em", textDecoration: "none", textTransform: "uppercase", fontFamily: "'Georgia', serif", fontWeight: 400, opacity: 0.85 }}>
                  {item}
                </a>
              ))}
            </div>
          </header>
        )}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0 }}>
        {images.map((src, index) => (
          <div key={src} style={{ minHeight: isMobile ? "62vw" : "28vw", background: index % 2 === 0 ? "#f0ece3" : "#e7e1d7", border: "1px solid rgba(0,0,0,0.04)" }}>
            <img src={src} alt={`CUCCI image ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </section>
    </div>
  );
}
