import { useCallback, useRef, useState, type MouseEvent } from "react";
import { Link } from "wouter";
import { formatPrice, type ShopProduct, getProductByHandle } from "@/data/products";
import { withBase } from "@/lib/withBase";

function productImageSrc(src: string) {
  return src.startsWith("http") ? src : withBase(src);
}

type CollectionProductCardProps = {
  product: ShopProduct;
  isMobile: boolean;
};

export default function CollectionProductCard({ product, isMobile }: CollectionProductCardProps) {
  const images = product.images.filter(Boolean).slice(0, 3);
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);

  const related =
    product.relatedHandles
      ?.map((h) => getProductByHandle(h))
      .filter(Boolean)
      .filter((p, i, arr) => arr.findIndex((x) => x!.handle === p!.handle) === i) ?? [];
  const colorCount = related.length > 1 ? related.length : 0;
  const count = images.length;
  const safeIndex = count ? ((index % count) + count) % count : 0;

  const goTo = useCallback(
    (next: number) => {
      if (count <= 1) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const onPointerDown = (clientX: number) => {
    if (count < 2) return;
    startX.current = clientX;
    dragging.current = true;
    moved.current = false;
  };

  const onPointerMove = (clientX: number) => {
    if (!dragging.current || startX.current == null) return;
    if (Math.abs(clientX - startX.current) > 8) moved.current = true;
  };

  const onPointerUp = (clientX?: number) => {
    if (!dragging.current || startX.current == null) return;
    const delta = clientX == null ? 0 : clientX - startX.current;
    dragging.current = false;
    startX.current = null;
    if (Math.abs(delta) > 40) {
      goTo(safeIndex + (delta < 0 ? 1 : -1));
    }
  };

  const stopNav = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div style={{ display: "block", color: "#1a1a1a" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3 / 4",
          overflow: "hidden",
          background: "#f4f4f4",
          marginBottom: 14,
          touchAction: "pan-y",
          userSelect: "none",
          cursor: count > 1 ? "grab" : "pointer",
        }}
        onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const x = e.changedTouches[0]?.clientX;
          onPointerUp(x);
        }}
        onMouseDown={(e) => onPointerDown(e.clientX)}
        onMouseMove={(e) => {
          if (dragging.current) onPointerMove(e.clientX);
        }}
        onMouseUp={(e) => onPointerUp(e.clientX)}
        onMouseLeave={() => {
          if (dragging.current) onPointerUp();
        }}
      >
        <Link
          href={`/products/${product.handle}`}
          onClick={(e) => {
            if (moved.current) {
              e.preventDefault();
              moved.current = false;
            }
          }}
          style={{ display: "block", width: "100%", height: "100%", color: "inherit", textDecoration: "none" }}
        >
          <img
            src={productImageSrc(images[safeIndex] ?? images[0])}
            alt={`${product.title} — ${product.colorLabel}`}
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
              pointerEvents: "none",
            }}
          />
        </Link>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                stopNav(e);
                goTo(safeIndex - 1);
              }}
              style={{
                position: "absolute",
                left: 6,
                top: "50%",
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.88)",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                color: "#111",
                zIndex: 2,
              }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                stopNav(e);
                goTo(safeIndex + 1);
              }}
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.88)",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                color: "#111",
                zIndex: 2,
              }}
            >
              ›
            </button>
            <div
              style={{
                position: "absolute",
                bottom: 10,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                gap: 6,
                zIndex: 2,
              }}
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`View image ${i + 1}`}
                  onClick={(e) => {
                    stopNav(e);
                    setIndex(i);
                  }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    background: i === safeIndex ? "#111" : "rgba(255,255,255,0.85)",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Link
        href={`/products/${product.handle}`}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: "center",
          textAlign: "center",
        }}
      >
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
      </Link>
    </div>
  );
}
