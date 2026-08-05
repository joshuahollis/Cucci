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

export const collectionProducts: ShopProduct[] = [
  {
    handle: "sweetsuit-hoodie-2",
    title: "Sweetsuit™ Hoodie",
    price: 50,
    colorLabel: "Blueberry Pie",
    colorHex: "#6B7BA8",
    relatedHandles: ["sweetsuit-hoodie", "sweetsuit-hoodie-1", "sweetsuit-hoodie-2"],
    optionNames: ["Color", "Size"],
    optionValues: [["Blueberry Pie 🫐"], ["S", "M", "L"]],
    sizes: ["S", "M", "L"],
    images: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/C5EECF6D-7C48-4F54-B0B0-5D7458623D85.jpg?v=1779409358",
      "/products/blueberry-hoodie/front.jpg",
      "/products/blueberry-hoodie/look-back.jpg",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/8AE20D5C-BE3E-4025-B5FD-161B315148E4.jpg?v=1779409358",
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
    relatedHandles: ["sweetsuit-pant", "sweetsuit-pant-1", "sweetsuit-pants"],
    optionNames: ["Color", "Size"],
    optionValues: [["Blueberry Pie 🫐"], ["S", "M", "L", "XL"]],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/IMG_2484.jpg?v=1778342141",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/ED89FC23-9931-48E3-9D34-013985BC11B5.jpg?v=1779409359",
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
    relatedHandles: ["sweetsuit-hoodie", "sweetsuit-hoodie-1", "sweetsuit-hoodie-2"],
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
    relatedHandles: ["sweetsuit-pant", "sweetsuit-pant-1", "sweetsuit-pants"],
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
    handle: "sweetsuit-hoodie-1",
    title: "Sweetsuit™ Hoodie",
    price: 50,
    colorLabel: "Peach Cobbler",
    colorHex: "#E8A87C",
    relatedHandles: ["sweetsuit-hoodie", "sweetsuit-hoodie-1", "sweetsuit-hoodie-2"],
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
    relatedHandles: ["sweetsuit-pant", "sweetsuit-pant-1", "sweetsuit-pants"],
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
    handle: "the-crystal-crop",
    title: "The Crystal Crop™",
    price: 30,
    colorLabel: "Black / Blue",
    colorHex: "#111111",
    optionNames: ["Color", "Crystal Color"],
    optionValues: [
      ["Black", "White"],
      ["Blue", "Pink"],
    ],
    sizes: [],
    images: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/C77DD258-7544-43AC-8B6D-0AA96A61EB84.jpg?v=1778292484",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/1C589AE2-544A-476D-ACEF-29F9A49F05D0.jpg?v=1778292484",
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/5EE7B6FF-5D65-4D28-AF60-14F32C4F9D2F.jpg?v=1778292484",
    ],
    tagline: "A classic cotton crop.",
    description:
      "Soft, breathable fabric with a close fit. Cropped length. Short sleeves. Crystal cucci detailing.",
    content: "100% cotton, exclusive of ornamentation.",
    care: "Machine wash cold inside out, dry on lower temperature.",
    variants: [
      { id: 50983524368617, options: ["Black", "Blue"], price: 30, available: true },
      { id: 50983524401385, options: ["Black", "Pink"], price: 30, available: true },
      { id: 50983524434153, options: ["White", "Blue"], price: 30, available: true },
      { id: 50983524466921, options: ["White", "Pink"], price: 30, available: true },
    ],
  },
];

export function getProductByHandle(handle: string): ShopProduct | undefined {
  return collectionProducts.find((p) => p.handle === handle);
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
