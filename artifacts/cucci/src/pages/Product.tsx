import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useParams } from "wouter";
import CartButton from "@/components/CartButton";
import { useCart } from "@/context/CartContext";
import {
  formatPrice,
  getProductByHandle,
  type ShopProduct,
} from "@/data/products";
import { withBase } from "@/lib/withBase";
import NotFound from "@/pages/not-found";
import sizeChartImage from "@assets/sizechart.png";

function productImageSrc(src: string) {
  return src.startsWith("http") ? src : withBase(src);
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: "1px solid #e5e5e5" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#1a1a1a",
        }}
      >
        {title}
        <span style={{ fontSize: 18, lineHeight: 1, opacity: 0.55 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 18,
            fontSize: 14,
            lineHeight: 1.65,
            color: "#333",
            letterSpacing: "0.01em",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function findVariant(product: ShopProduct, selected: string[]) {
  return product.variants.find((v) =>
    v.options.every((opt, i) => opt === selected[i] || selected[i] === undefined),
  );
}

export default function ProductPage() {
  const params = useParams<{ handle: string }>();
  const product = getProductByHandle(params.handle ?? "");
  const { addItem } = useCart();
  const [, setLocation] = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [openFit, setOpenFit] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
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

  useEffect(() => {
    if (!product) return;
    setImageIndex(0);
    setSizeError(false);
    setOpenFit(false);
    setQuantity(1);
    // Preselect first option of each axis when it's a single value; leave sizes unselected
    setSelectedOptions(
      product.optionValues.map((vals, i) => {
        const name = product.optionNames[i]?.toLowerCase() ?? "";
        if (name.includes("size")) return "";
        return vals[0] ?? "";
      }),
    );
  }, [product?.handle]);

  const navItems = useMemo(() => ["Collections", "Intimates", "Cucci Care"], []);
  const closeSearch = () => setIsSearchOpen(false);

  if (!product) {
    return <NotFound />;
  }

  const relatedColors =
    product.relatedHandles
      ?.map((h) => getProductByHandle(h))
      .filter((p): p is ShopProduct => Boolean(p))
      .filter((p, i, arr) => arr.findIndex((x) => x.handle === p.handle) === i) ?? [];

  const selectedVariant = findVariant(
    product,
    selectedOptions.map((s, i) => {
      if (s) return s;
      return product.optionValues[i]?.[0] ?? "";
    }),
  );

  const sizeIndex = product.optionNames.findIndex((n) => n.toLowerCase().includes("size"));
  const needsSize = sizeIndex >= 0;
  const sizeSelected = needsSize ? Boolean(selectedOptions[sizeIndex]) : true;
  const showSizeChart = product.title.toLowerCase().includes("sweetsuit");

  const resolveVariant = () => {
    if (needsSize && !sizeSelected) {
      setSizeError(true);
      return null;
    }
    const opts = selectedOptions.map((s, i) => s || product.optionValues[i][0]);
    const variant = findVariant(product, opts);
    if (!variant || !variant.available) return null;
    return { variant, opts };
  };

  const buildCartPayload = () => {
    const resolved = resolveVariant();
    if (!resolved) return null;
    const colorIndex = product.optionNames.findIndex((n) => n.toLowerCase().includes("color"));
    const size =
      sizeIndex >= 0 ? resolved.opts[sizeIndex] : undefined;
    return {
      productHandle: product.handle,
      variantId: resolved.variant.id,
      title: product.title,
      colorLabel:
        colorIndex >= 0
          ? resolved.opts[colorIndex] || product.colorLabel
          : product.colorLabel,
      size,
      price: resolved.variant.price,
      image: product.images[0],
      quantity,
    };
  };

  const handleAddToCart = () => {
    const payload = buildCartPayload();
    if (!payload) return;
    addItem(payload);
  };

  const handleBuyNow = () => {
    const payload = buildCartPayload();
    if (!payload) return;
    addItem(payload, { openCart: false });
    setLocation("/checkout");
  };

  const setOption = (optionIndex: number, value: string) => {
    setSelectedOptions((prev) => {
      const next = [...prev];
      next[optionIndex] = value;
      return next;
    });
    if (product.optionNames[optionIndex]?.toLowerCase().includes("size")) {
      setSizeError(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#fff", minHeight: "100vh", color: "#1a1a1a" }}>
      {!isMobile && (
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "flex-start",
            padding: "28px 48px 20px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
          }}
        >
          <a
            href={withBase("/")}
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
              color: "#111",
              fontSize: "13px",
              letterSpacing: "0.3em",
              fontFamily: "'Georgia', serif",
              textTransform: "uppercase",
              textDecoration: "none",
              marginTop: 4,
            }}
          >
            CUCCI
          </a>
          <nav style={{ flex: 1, display: "flex", justifyContent: "center", gap: "56px", marginLeft: "24px" }}>
            {navItems.map((item) => (
              <a
                key={item}
                href={
                  item === "Collections"
                    ? withBase("/collections")
                    : item === "Intimates"
                      ? withBase("/intimates")
                      : item === "Cucci Care"
                        ? withBase("/cuccicare")
                        : "#"
                }
                style={{
                  color: "#111",
                  fontSize: "13px",
                  letterSpacing: "0.1em",
                  textDecoration: "none",
                  opacity: item === "Collections" ? 0.5 : 0.9,
                }}
              >
                {item}
              </a>
            ))}
          </nav>
          <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
            <button
              onClick={() => setIsSearchOpen(true)}
              style={{
                color: "#111",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "inherit",
                opacity: 0.85,
              }}
            >
              Search
            </button>
            <CartButton />
          </div>
        </header>
      )}

      {isMobile && (
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 20px",
            background: "rgba(255,255,255,0.95)",
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
              <span key={i} style={{ display: "block", width: 22, height: 1, background: "#111" }} />
            ))}
          </button>
          <a
            href={withBase("/")}
            style={{
              color: "#111",
              fontSize: 14,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            CUCCI
          </a>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button
              onClick={() => setIsSearchOpen(true)}
              style={{
                color: "#111",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 11,
                letterSpacing: "0.15em",
                fontFamily: "inherit",
              }}
            >
              Search
            </button>
            <CartButton />
          </div>
        </header>
      )}

      <main
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
          gap: isMobile ? 0 : 48,
          maxWidth: 1400,
          margin: "0 auto",
          padding: isMobile ? "0 0 80px" : "12px 48px 100px",
          alignItems: "start",
        }}
      >
        {/* Gallery */}
        <div>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: isMobile ? "3 / 4" : "auto",
              background: "#f5f5f5",
              overflow: "hidden",
            }}
          >
            <img
              src={productImageSrc(product.images[imageIndex] ?? product.images[0])}
              alt={product.title}
              style={{
                width: "100%",
                height: isMobile ? "100%" : "auto",
                maxHeight: isMobile ? "none" : "85vh",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
              }}
            />
            {product.images.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`View image ${i + 1}`}
                    onClick={() => setImageIndex(i)}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      background: i === imageIndex ? "#111" : "rgba(255,255,255,0.85)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {!isMobile && product.images.length > 1 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 8,
              }}
            >
              {product.images.slice(1).map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImageIndex(i + 1)}
                  style={{
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    background: "#f5f5f5",
                    aspectRatio: "3 / 4",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={productImageSrc(src)}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div
          style={{
            padding: isMobile ? "28px 20px 0" : "24px 12px 0 0",
            position: isMobile ? "relative" : "sticky",
            top: isMobile ? undefined : 96,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#888" }}>
            <Link href="/collections" style={{ color: "inherit", textDecoration: "none" }}>
              Collections
            </Link>
          </p>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: isMobile ? 22 : 26,
              fontWeight: 400,
              letterSpacing: "0.02em",
              lineHeight: 1.25,
            }}
          >
            {product.title}
          </h1>

          <p style={{ margin: "0 0 28px", fontSize: 15, letterSpacing: "0.02em" }}>
            {formatPrice(product.price)}
          </p>

          {/* Color siblings */}
          {relatedColors.length > 1 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, color: "#666" }}>
                Color — {product.colorLabel}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {relatedColors.map((sibling) => {
                  const active = sibling.handle === product.handle;
                  return (
                    <Link
                      key={sibling.handle}
                      href={`/products/${sibling.handle}`}
                      title={sibling.colorLabel}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: sibling.colorHex,
                        border: active ? "1px solid #111" : "1px solid #ddd",
                        boxShadow: active ? "inset 0 0 0 2px #fff" : "none",
                        display: "block",
                        textDecoration: "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Crystal crop / multi option selectors (non-size) */}
          {product.optionNames.map((name, optionIndex) => {
            if (name.toLowerCase().includes("size")) return null;
            if (relatedColors.length > 1 && name.toLowerCase() === "color") return null;
            const values = product.optionValues[optionIndex];
            if (!values || values.length <= 1) return null;
            return (
              <div key={name} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, color: "#666" }}>
                  {name} — {selectedOptions[optionIndex] || values[0]}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {values.map((value) => {
                    const active = (selectedOptions[optionIndex] || values[0]) === value;
                    const isColorSwatch = name.toLowerCase().includes("color");
                    const swatch =
                      value === "Black"
                        ? "#111"
                        : value === "White"
                          ? "#f2f2f2"
                          : value === "Blue"
                            ? "#6B9BD1"
                            : value === "Pink"
                              ? "#E8A0BF"
                              : undefined;
                    if (isColorSwatch && swatch) {
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setOption(optionIndex, value)}
                          title={value}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: swatch,
                            border: active ? "1px solid #111" : "1px solid #ddd",
                            boxShadow: active ? "inset 0 0 0 2px #fff" : "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        />
                      );
                    }
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setOption(optionIndex, value)}
                        style={{
                          minWidth: 44,
                          height: 40,
                          padding: "0 14px",
                          border: active ? "1px solid #111" : "1px solid #ddd",
                          background: active ? "#111" : "#fff",
                          color: active ? "#fff" : "#111",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 13,
                        }}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Size */}
          {needsSize && sizeIndex >= 0 && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: sizeError ? "#a33" : "#666" }}>
                  {sizeError ? "Please select a size" : "Size"}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenFit((v) => !v)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textDecoration: "underline",
                    color: "#666",
                  }}
                >
                  Size and fit
                </button>
              </div>
              {openFit && (
                <div style={{ margin: "0 0 14px" }}>
                  <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.6, color: "#555" }}>
                    High-rise drawstring fit. Contoured through the body. {product.modelInfo}
                  </p>
                  {showSizeChart && (
                    <img
                      src={sizeChartImage}
                      alt="Cucci size chart"
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  )}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.optionValues[sizeIndex].map((size) => {
                  const active = selectedOptions[sizeIndex] === size;
                  const optsPreview = product.optionValues.map((vals, i) =>
                    i === sizeIndex ? size : selectedOptions[i] || vals[0],
                  );
                  const variant = findVariant(product, optsPreview);
                  const unavailable = variant ? !variant.available : false;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={unavailable}
                      onClick={() => setOption(sizeIndex, size)}
                      style={{
                        minWidth: 48,
                        height: 42,
                        padding: "0 14px",
                        border: active ? "1px solid #111" : "1px solid #ddd",
                        background: active ? "#111" : "#fff",
                        color: unavailable ? "#bbb" : active ? "#fff" : "#111",
                        cursor: unavailable ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        fontSize: 13,
                        textDecoration: unavailable ? "line-through" : "none",
                        opacity: unavailable ? 0.55 : 1,
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, color: "#666" }}>
              Quantity
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid #ccc",
                height: 42,
              }}
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: 40,
                  height: "100%",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  fontFamily: "inherit",
                }}
              >
                −
              </button>
              <span style={{ minWidth: 32, textAlign: "center", fontSize: 14 }}>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                style={{
                  width: 40,
                  height: "100%",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  fontFamily: "inherit",
                }}
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={Boolean(selectedVariant && !selectedVariant.available)}
            style={{
              width: "100%",
              height: 48,
              marginTop: 8,
              marginBottom: 8,
              border: "1px solid #111",
              background: "#fff",
              color: "#111",
              cursor: selectedVariant && !selectedVariant.available ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {selectedVariant && !selectedVariant.available ? "Sold out" : "Add to cart"}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={Boolean(selectedVariant && !selectedVariant.available)}
            style={{
              width: "100%",
              height: 48,
              marginBottom: 20,
              border: "1px solid #e6c84a",
              background: "#f5d76e",
              color: "#111",
              cursor: selectedVariant && !selectedVariant.available ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Buy it now
          </button>

          <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.65, color: "#333" }}>
            <strong style={{ fontWeight: 600 }}>{product.tagline}</strong>
            <br />
            {product.description}
          </p>

          <div>
            <Accordion title="Description" defaultOpen>
              <p style={{ margin: 0 }}>{product.description}</p>
              {product.modelInfo && (
                <p style={{ margin: "12px 0 0" }}>{product.modelInfo}</p>
              )}
            </Accordion>
            <Accordion title="Fabric">
              <p style={{ margin: 0 }}>{product.content}</p>
            </Accordion>
            <Accordion title="Care">
              <p style={{ margin: 0 }}>{product.care}</p>
            </Accordion>
            {showSizeChart && (
              <Accordion title="Size chart">
                <img
                  src={sizeChartImage}
                  alt="Cucci size chart"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </Accordion>
            )}
          </div>
        </div>
      </main>

      {isMobile && menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#f7dfe6", display: "flex", flexDirection: "column", padding: "28px 28px 40px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 36 }}>
            <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#2a2420", fontFamily: "inherit", lineHeight: 1, padding: 0 }} aria-label="Close menu">
              ×
            </button>
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, alignItems: "center" }}>
            {navItems.map((item) => (
              <a
                key={item}
                href={
                  item === "Collections"
                    ? withBase("/collections")
                    : item === "Intimates"
                      ? withBase("/intimates")
                      : item === "Cucci Care"
                        ? withBase("/cuccicare")
                        : "#"
                }
                onClick={() => setMenuOpen(false)}
                style={{ color: "#2a2420", fontSize: 22, letterSpacing: "0.12em", textDecoration: "none" }}
              >
                {item}
              </a>
            ))}
          </nav>
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
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                height: "100%",
                padding: isMobile ? "22px 18px" : "28px 32px",
                color: "#111",
                display: "flex",
                flexDirection: "column",
                gap: 28,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                <a href={withBase("/")} style={{ color: "#111", textDecoration: "none" }}>
                  CUCCI
                </a>
                <button onClick={closeSearch} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#111", font: "inherit" }}>
                  Close
                </button>
              </div>
              <input
                aria-label="Search"
                placeholder="Search"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: isMobile ? 18 : 22,
                  color: "#111",
                  padding: "0 0 12px",
                  borderBottom: "1px solid #111",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
