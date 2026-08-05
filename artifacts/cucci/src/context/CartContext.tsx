import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  key: string;
  productHandle: string;
  variantId: number;
  title: string;
  colorLabel: string;
  size?: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  lastAddedKey: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    item: Omit<CartLine, "key" | "quantity"> & { quantity?: number },
    options?: { openCart?: boolean },
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "cucci-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(variantId: number, productHandle: string) {
  return `${productHandle}:${variantId}`;
}

function readStoredItems(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.key === "string" &&
        typeof item.variantId === "number" &&
        typeof item.quantity === "number" &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);

  useEffect(() => {
    setItems(readStoredItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addItem = useCallback(
    (
      item: Omit<CartLine, "key" | "quantity"> & { quantity?: number },
      options?: { openCart?: boolean },
    ) => {
      const key = lineKey(item.variantId, item.productHandle);
      const qty = Math.max(1, item.quantity ?? 1);
      setItems((prev) => {
        const existing = prev.find((line) => line.key === key);
        if (existing) {
          return prev.map((line) =>
            line.key === key ? { ...line, quantity: line.quantity + qty } : line,
          );
        }
        return [
          ...prev,
          {
            ...item,
            key,
            quantity: qty,
          },
        ];
      });
      setLastAddedKey(key);
      if (options?.openCart !== false) {
        setIsCartOpen(true);
      }
    },
    [],
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.key !== key);
      return prev.map((line) => (line.key === key ? { ...line, quantity } : line));
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((line) => line.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isCartOpen,
      lastAddedKey,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      isCartOpen,
      lastAddedKey,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
