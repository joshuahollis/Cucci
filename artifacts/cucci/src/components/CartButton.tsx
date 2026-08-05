import { useCart } from "@/context/CartContext";

type CartButtonProps = {
  color?: string;
  onOpenSearch?: () => void;
};

/** Top-right cart control with live item count; opens the cart dropdown. */
export default function CartButton({ color = "#111" }: CartButtonProps) {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Cart with ${itemCount} items`}
      style={{
        color,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: "11px",
        letterSpacing: "0.18em",
        textDecoration: "none",
        textTransform: "uppercase",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontWeight: 400,
        opacity: 0.85,
        position: "relative",
      }}
    >
      ({itemCount})
    </button>
  );
}
