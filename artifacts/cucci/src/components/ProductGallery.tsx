import { useCallback, useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/withBase";

function productImageSrc(src: string) {
  return src.startsWith("http") ? src : withBase(src);
}

type ProductGalleryProps = {
  images: string[];
  alt: string;
  isMobile: boolean;
  imageIndex: number;
  onIndexChange: (index: number) => void;
};

export default function ProductGallery({
  images,
  alt,
  isMobile,
  imageIndex,
  onIndexChange,
}: ProductGalleryProps) {
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const count = images.length;

  const goTo = useCallback(
    (next: number) => {
      if (count <= 0) return;
      const wrapped = ((next % count) + count) % count;
      onIndexChange(wrapped);
    },
    [count, onIndexChange],
  );

  const goPrev = useCallback(() => goTo(imageIndex - 1), [goTo, imageIndex]);
  const goNext = useCallback(() => goTo(imageIndex + 1), [goTo, imageIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const onPointerDown = (clientX: number) => {
    if (count < 2) return;
    startX.current = clientX;
    dragging.current = true;
    setDragOffset(0);
  };

  const onPointerMove = (clientX: number) => {
    if (!dragging.current || startX.current == null) return;
    setDragOffset(clientX - startX.current);
  };

  const onPointerUp = () => {
    if (!dragging.current || startX.current == null) return;
    const delta = dragOffset;
    dragging.current = false;
    startX.current = null;
    setDragOffset(0);
    if (Math.abs(delta) > 40) {
      if (delta < 0) goNext();
      else goPrev();
    }
  };

  if (count === 0) return null;

  return (
    <div>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: isMobile ? "3 / 4" : "auto",
          background: "#f5f5f5",
          overflow: "hidden",
          touchAction: "pan-y",
          cursor: count > 1 ? "grab" : "default",
          userSelect: "none",
        }}
        onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
        onTouchEnd={onPointerUp}
        onMouseDown={(e) => onPointerDown(e.clientX)}
        onMouseMove={(e) => {
          if (dragging.current) onPointerMove(e.clientX);
        }}
        onMouseUp={onPointerUp}
        onMouseLeave={() => {
          if (dragging.current) onPointerUp();
        }}
      >
        <img
          src={productImageSrc(images[imageIndex] ?? images[0])}
          alt={alt}
          draggable={false}
          style={{
            width: "100%",
            height: isMobile ? "100%" : "auto",
            maxHeight: isMobile ? "none" : "85vh",
            objectFit: "cover",
            objectPosition: "center top",
            display: "block",
            transform: dragOffset ? `translateX(${dragOffset * 0.35}px)` : undefined,
            transition: dragOffset ? "none" : "transform 0.2s ease",
            pointerEvents: "none",
          }}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.85)",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                color: "#111",
              }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.85)",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                color: "#111",
              }}
            >
              ›
            </button>

            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                fontSize: 11,
                letterSpacing: "0.06em",
                padding: "4px 8px",
                borderRadius: 999,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              {imageIndex + 1}/{count}
            </div>

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
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`View image ${i + 1}`}
                  onClick={() => onIndexChange(i)}
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
          </>
        )}
      </div>

      {!isMobile && count > 1 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(count, 3)}, 1fr)`,
            gap: 8,
            marginTop: 8,
          }}
        >
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => onIndexChange(i)}
              style={{
                border: i === imageIndex ? "1px solid #111" : "1px solid transparent",
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
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  display: "block",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
