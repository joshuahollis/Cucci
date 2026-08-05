export type ProductVariant = {
  id: number;
  options: string[];
  price: number;
  available: boolean;
};

export type ShopProduct = {
  handle: string;
  title: string;
  price: number;
  colorLabel: string;
  colorHex: string;
  relatedHandles?: string[];
  optionNames: string[];
  optionValues: string[][];
  sizes: string[];
  images: string[];
  /** Optional gallery overrides keyed by Color option value (e.g. Black / White). */
  imagesByColor?: Record<string, string[]>;
  tagline: string;
  description: string;
  content: string;
  care: string;
  modelInfo?: string;
  variants: ProductVariant[];
};

const sweetsuitCopy = {
  tagline: "Soft. Sculpted. Shiny.",
  description:
    "A plush velour set designed to contour the body. Featuring a cropped hoodie with a heart detail at the left chest and matching high-rise drawstring pants finished with signature cucci detailing at the back.",
  content: "53% cotton 42% polyester 5% spandex, exclusive of ornamentation.",
  care: "Recommended hand wash cold and air dry. Can machine wash inside out and low temperature dry.",
};

/** Black selection leads with black; white shirt replaces the duplicate black frame. */
const crystalBlackImages = [
  "/products/crystal-crop/black-pink-1.jpg",
  "/products/crystal-crop/white-pink.jpg",
  "/products/crystal-crop/black-pink-2.jpg",
];

/** White selection leads with white so cart/checkout thumbnails match. */
const crystalWhiteImages = [
  "/products/crystal-crop/white-pink.jpg",
  "/products/crystal-crop/black-pink-1.jpg",
  "/products/crystal-crop/black-pink-2.jpg",
];

/** Catalog thumbnail + hover: black then white (not two blacks). */
const crystalCatalogImages = [
  "/products/crystal-crop/black-pink-1.jpg",
  "/products/crystal-crop/white-pink.jpg",
  "/products/crystal-crop/black-pink-2.jpg",
];

/** Catalog order: orange (Peach), blue (Blueberry), pink (Strawberry), then crystal. */
export const collectionProducts: ShopProduct[] = [
  {
    handle: "sweetsuit-hoodie-1",
    title: "Sweetsuit™ Hoodie",
    price: 50,
    colorLabel: "Peach Cobbler",
    colorHex: "#E8A87C",
    relatedHandles: ["sweetsuit-hoodie-1", "sweetsuit-hoodie-2", "sweetsuit-hoodie"],
    optionNames: ["Color", "Size"],
    optionValues: [["Peach cobbler 🍑"], ["S", "M", "L"]],
    sizes: ["S", "M", "L"],
    images: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/46B1B0C4-86EC-4249-8D6F-1CBF62073C8A.jpg?v=1778293284",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/C5EBB958-9F71-4F27-8EC7-6AB093C2E5ED.jpg?v=1778293284",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/IMG_2391.jpg?v=1778293901",
    ],
    ...sweetsuitCopy,
    modelInfo: "Model is wearing size small.",
    variants: [
      { id: 50983476887785, options: ["Peach cobbler 🍑", "S"], price: 50, available: true },
      { id: 50983476920553, options: ["Peach cobbler 🍑", "M"], price: 50, available: true },
      { id: 50983476953321, options: ["Peach cobbler 🍑", "L"], price: 50, available: true },
    ],
  },
  {
    handle: "sweetsuit-pant-1",
    title: "Sweetsuit™ Pant",
    price: 50,
    colorLabel: "Peach Cobbler",
    colorHex: "#E8A87C",
    relatedHandles: ["sweetsuit-pant-1", "sweetsuit-pants", "sweetsuit-pant"],
    optionNames: ["Color", "Size"],
    optionValues: [["Peach cobbler 🍑"], ["S", "M", "L"]],
    sizes: ["S", "M", "L"],
    images: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/D904C21B-3202-4AAA-ABDF-D7EC16D351C3.jpg?v=1778293284",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/0142B751-ED1E-41C3-A5FB-108F44C72D7B.jpg?v=1778293284",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/03A4DB6F-33E7-4264-AFD6-7EB210428CA9.jpg?v=1778293284",
    ],
    ...sweetsuitCopy,
    modelInfo: "Model is wearing size small.",
    variants: [
      { id: 50983475773673, options: ["Peach cobbler 🍑", "S"], price: 50, available: true },
      { id: 50983504314601, options: ["Peach cobbler 🍑", "M"], price: 50, available: true },
      { id: 50983504347369, options: ["Peach cobbler 🍑", "L"], price: 50, available: true },
    ],
  },
  {
    handle: "sweetsuit-hoodie-2",
    title: "Sweetsuit™ Hoodie",
    price: 50,
    colorLabel: "Blueberry Pie",
    colorHex: "#6B7BA8",
    relatedHandles: ["sweetsuit-hoodie-1", "sweetsuit-hoodie-2", "sweetsuit-hoodie"],
    optionNames: ["Color", "Size"],
    optionValues: [["Blueberry Pie 🫐"], ["S", "M", "L"]],
    sizes: ["S", "M", "L"],
    // Model first; flat product hoodie replaces the former side-profile shot
    images: [
      "/products/blueberry-hoodie/front.jpg",
      "/products/blueberry-hoodie/flat.jpg",
    ],
    ...sweetsuitCopy,
    modelInfo: "Model is wearing size medium.",
    variants: [
      { id: 51113821569257, options: ["Blueberry Pie 🫐", "S"], price: 50, available: true },
      { id: 51113824911593, options: ["Blueberry Pie 🫐", "M"], price: 50, available: true },
      { id: 51113824944361, options: ["Blueberry Pie 🫐", "L"], price: 50, available: true },
    ],
  },
  {
    handle: "sweetsuit-pants",
    title: "Sweetsuit™ Pants",
    price: 50,
    colorLabel: "Blueberry Pie",
    colorHex: "#6B7BA8",
    relatedHandles: ["sweetsuit-pant-1", "sweetsuit-pants", "sweetsuit-pant"],
    optionNames: ["Color", "Size"],
    optionValues: [["Blueberry Pie 🫐"], ["S", "M", "L", "XL"]],
    sizes: ["S", "M", "L", "XL"],
    // Model photos first; flat product last
    images: [
      "/products/blueberry-pants/look.jpg",
      "/products/blueberry-pants/back.jpg",
      "/products/blueberry-pants/flat.jpg",
    ],
    ...sweetsuitCopy,
    modelInfo: "Model is wearing size large.",
    variants: [
      { id: 51113729163497, options: ["Blueberry Pie 🫐", "S"], price: 50, available: true },
      { id: 51113734799593, options: ["Blueberry Pie 🫐", "M"], price: 50, available: true },
      { id: 51113734832361, options: ["Blueberry Pie 🫐", "L"], price: 50, available: true },
      { id: 51113825927401, options: ["Blueberry Pie 🫐", "XL"], price: 50, available: true },
    ],
  },
  {
    handle: "sweetsuit-hoodie",
    title: "Sweetsuit™ Hoodie",
    price: 50,
    colorLabel: "Strawberry Shortcake",
    colorHex: "#E85A8A",
    relatedHandles: ["sweetsuit-hoodie-1", "sweetsuit-hoodie-2", "sweetsuit-hoodie"],
    optionNames: ["Color", "Size"],
    optionValues: [["Strawberry Shortcake 🍓"], ["S", "M", "L"]],
    sizes: ["S", "M", "L"],
    images: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/C870D6BB-16BB-4F0A-A9DF-3832C2CDEDA2.jpg?v=1778292640",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/D3FFC24E-FAC7-4DD3-8CFF-18E3F01AD477.jpg?v=1778292640",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/9A875B10-3689-4E8E-9286-0172A2CDED6C.jpg?v=1778292821",
    ],
    ...sweetsuitCopy,
    modelInfo: "Model is wearing size medium.",
    variants: [
      { id: 50983509721321, options: ["Strawberry Shortcake 🍓", "S"], price: 50, available: true },
      { id: 50983475151081, options: ["Strawberry Shortcake 🍓", "M"], price: 50, available: true },
      { id: 50983509688553, options: ["Strawberry Shortcake 🍓", "L"], price: 50, available: true },
    ],
  },
  {
    handle: "sweetsuit-pant",
    title: "Sweetsuit™ Pant",
    price: 50,
    colorLabel: "Strawberry Shortcake",
    colorHex: "#E85A8A",
    relatedHandles: ["sweetsuit-pant-1", "sweetsuit-pants", "sweetsuit-pant"],
    optionNames: ["Color", "Size"],
    optionValues: [["Strawberry Shortcake 🍓"], ["M", "L", "XL"]],
    sizes: ["M", "L", "XL"],
    images: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/B5872DAD-3407-4470-8828-8A0DA1D3C330.jpg?v=1778292640",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/5C5DE52E-B3BC-49F6-8572-A2AB517E4C3B.jpg?v=1778292640",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/9A875B10-3689-4E8E-9286-0172A2CDED6C.jpg?v=1778292821",
    ],
    ...sweetsuitCopy,
    modelInfo: "Model is wearing size medium.",
    variants: [
      { id: 50983472693481, options: ["Strawberry Shortcake 🍓", "M"], price: 50, available: true },
      { id: 50983580074217, options: ["Strawberry Shortcake 🍓", "L"], price: 50, available: true },
      { id: 50983580106985, options: ["Strawberry Shortcake 🍓", "XL"], price: 50, available: true },
    ],
  },
  {
    handle: "the-crystal-crop",
    title: "The Crystal Crop™",
    price: 30,
    colorLabel: "Black / Pink",
    colorHex: "#111111",
    optionNames: ["Color", "Crystal Color"],
    optionValues: [
      ["Black", "White"],
      ["Pink", "Blue"],
    ],
    sizes: [],
    images: crystalCatalogImages,
    imagesByColor: {
      Black: crystalBlackImages,
      White: crystalWhiteImages,
    },
    tagline: "A classic cotton crop.",
    description:
      "Soft, breathable fabric with a close fit. Cropped length. Short sleeves. Crystal cucci detailing.",
    content: "100% cotton, exclusive of ornamentation.",
    care: "Machine wash cold inside out, dry on lower temperature.",
    variants: [
      { id: 50983524401385, options: ["Black", "Pink"], price: 30, available: true },
      { id: 50983524368617, options: ["Black", "Blue"], price: 30, available: true },
      { id: 50983524466921, options: ["White", "Pink"], price: 30, available: true },
      { id: 50983524434153, options: ["White", "Blue"], price: 30, available: true },
    ],
  },
];

export function getProductByHandle(handle: string): ShopProduct | undefined {
  return collectionProducts.find((p) => p.handle === handle);
}

/** Resolve the swipeable gallery for the current color selection. */
export function getGalleryImages(
  product: ShopProduct,
  selectedOptions: string[] = [],
): string[] {
  const colorIndex = product.optionNames.findIndex((n) => {
    const lower = n.toLowerCase();
    return lower === "color" || (lower.includes("color") && !lower.includes("crystal"));
  });
  const colorValue =
    (colorIndex >= 0 ? selectedOptions[colorIndex] : undefined) ||
    product.optionValues[colorIndex]?.[0] ||
    "";

  if (product.imagesByColor && colorValue && product.imagesByColor[colorValue]?.length) {
    return product.imagesByColor[colorValue];
  }
  return product.images;
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)} USD`;
}

/** Legacy type kept for unused ProductCard components */
export type Product = {
  id: number;
  name: string;
  price: number;
  category: "intimates" | "sweatsuits" | "basics" | "care";
  colors: { name: string; hex: string }[];
  image: string;
};

export const products: Product[] = [];
