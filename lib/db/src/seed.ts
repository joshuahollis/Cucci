/**
 * Seed catalog + inventory for Cucci commerce.
 *
 * Usage (from repo root, with DATABASE_URL set):
 *   pnpm --filter @workspace/db exec tsx ./src/seed.ts
 *
 * Inventory defaults to 1 unit per SKU (~13–24 physical units depending on catalog).
 * Adjust inventory_on_hand in the DB after seeding to match real stock.
 */
import { db, pool } from "./index";
import { products, variants } from "./schema";

type SeedVariant = {
  id: string;
  sku: string;
  color: string;
  size: string;
  unitAmount: number;
  inventoryOnHand: number;
  imageUrl?: string;
};

type SeedProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrls: string[];
  variants: SeedVariant[];
};

const catalog: SeedProduct[] = [
  {
    id: "prod_ss_hoodie_blueberry",
    slug: "sweetsuit-hoodie-2",
    name: "Sweetsuit™ Hoodie",
    description:
      "Soft. Sculpted. Shiny. A plush velour cropped hoodie with heart detail. Color: Blueberry Pie.",
    imageUrls: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/C5EECF6D-7C48-4F54-B0B0-5D7458623D85.jpg?v=1779409358",
    ],
    variants: [
      { id: "51113821569257", sku: "SS-H-BB-S", color: "Blueberry Pie", size: "S", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "51113824911593", sku: "SS-H-BB-M", color: "Blueberry Pie", size: "M", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "51113824944361", sku: "SS-H-BB-L", color: "Blueberry Pie", size: "L", unitAmount: 5000, inventoryOnHand: 1 },
    ],
  },
  {
    id: "prod_ss_pants_blueberry",
    slug: "sweetsuit-pants",
    name: "Sweetsuit™ Pants",
    description: "Matching high-rise drawstring pants. Color: Blueberry Pie.",
    imageUrls: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/IMG_2484.jpg?v=1778342141",
    ],
    variants: [
      { id: "51113729163497", sku: "SS-P-BB-S", color: "Blueberry Pie", size: "S", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "51113734799593", sku: "SS-P-BB-M", color: "Blueberry Pie", size: "M", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "51113734832361", sku: "SS-P-BB-L", color: "Blueberry Pie", size: "L", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "51113825927401", sku: "SS-P-BB-XL", color: "Blueberry Pie", size: "XL", unitAmount: 5000, inventoryOnHand: 1 },
    ],
  },
  {
    id: "prod_ss_hoodie_strawberry",
    slug: "sweetsuit-hoodie",
    name: "Sweetsuit™ Hoodie",
    description: "Soft. Sculpted. Shiny. Color: Strawberry Shortcake.",
    imageUrls: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/C870D6BB-16BB-4F0A-A9DF-3832C2CDEDA2.jpg?v=1778292640",
    ],
    variants: [
      { id: "50983509721321", sku: "SS-H-SS-S", color: "Strawberry Shortcake", size: "S", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "50983475151081", sku: "SS-H-SS-M", color: "Strawberry Shortcake", size: "M", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "50983509688553", sku: "SS-H-SS-L", color: "Strawberry Shortcake", size: "L", unitAmount: 5000, inventoryOnHand: 1 },
    ],
  },
  {
    id: "prod_ss_pant_strawberry",
    slug: "sweetsuit-pant",
    name: "Sweetsuit™ Pant",
    description: "Matching pants. Color: Strawberry Shortcake.",
    imageUrls: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/B5872DAD-3407-4470-8828-8A0DA1D3C330.jpg?v=1778292640",
    ],
    variants: [
      { id: "50983472693481", sku: "SS-P-SS-M", color: "Strawberry Shortcake", size: "M", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "50983580074217", sku: "SS-P-SS-L", color: "Strawberry Shortcake", size: "L", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "50983580106985", sku: "SS-P-SS-XL", color: "Strawberry Shortcake", size: "XL", unitAmount: 5000, inventoryOnHand: 1 },
    ],
  },
  {
    id: "prod_ss_hoodie_peach",
    slug: "sweetsuit-hoodie-1",
    name: "Sweetsuit™ Hoodie",
    description: "Soft. Sculpted. Shiny. Color: Peach Cobbler.",
    imageUrls: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/46B1B0C4-86EC-4249-8D6F-1CBF62073C8A.jpg?v=1778293284",
    ],
    variants: [
      { id: "50983476887785", sku: "SS-H-PC-S", color: "Peach Cobbler", size: "S", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "50983476920553", sku: "SS-H-PC-M", color: "Peach Cobbler", size: "M", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "50983476953321", sku: "SS-H-PC-L", color: "Peach Cobbler", size: "L", unitAmount: 5000, inventoryOnHand: 1 },
    ],
  },
  {
    id: "prod_ss_pant_peach",
    slug: "sweetsuit-pant-1",
    name: "Sweetsuit™ Pant",
    description: "Matching pants. Color: Peach Cobbler.",
    imageUrls: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/D904C21B-3202-4AAA-ABDF-D7EC16D351C3.jpg?v=1778293284",
    ],
    variants: [
      { id: "50983475773673", sku: "SS-P-PC-S", color: "Peach Cobbler", size: "S", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "50983504314601", sku: "SS-P-PC-M", color: "Peach Cobbler", size: "M", unitAmount: 5000, inventoryOnHand: 1 },
      { id: "50983504347369", sku: "SS-P-PC-L", color: "Peach Cobbler", size: "L", unitAmount: 5000, inventoryOnHand: 1 },
    ],
  },
  {
    id: "prod_crystal_crop",
    slug: "the-crystal-crop",
    name: "The Crystal Crop™",
    description: "A classic cotton crop with crystal cucci detailing.",
    imageUrls: [
      "https://cdn.shopify.com/s/files/1/0808/3613/3097/files/C77DD258-7544-43AC-8B6D-0AA96A61EB84.jpg?v=1778292484",
    ],
    variants: [
      { id: "50983524368617", sku: "CC-BLK-BLU", color: "Black / Blue", size: "OS", unitAmount: 3000, inventoryOnHand: 1 },
      { id: "50983524401385", sku: "CC-BLK-PNK", color: "Black / Pink", size: "OS", unitAmount: 3000, inventoryOnHand: 1 },
      { id: "50983524434153", sku: "CC-WHT-BLU", color: "White / Blue", size: "OS", unitAmount: 3000, inventoryOnHand: 1 },
      { id: "50983524466921", sku: "CC-WHT-PNK", color: "White / Pink", size: "OS", unitAmount: 3000, inventoryOnHand: 1 },
    ],
  },
];

async function main() {
  for (const product of catalog) {
    await db
      .insert(products)
      .values({
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        active: true,
        imageUrls: product.imageUrls,
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          slug: product.slug,
          name: product.name,
          description: product.description,
          imageUrls: product.imageUrls,
          active: true,
          updatedAt: new Date(),
        },
      });

    for (const v of product.variants) {
      await db
        .insert(variants)
        .values({
          id: v.id,
          productId: product.id,
          sku: v.sku,
          color: v.color,
          size: v.size,
          unitAmount: v.unitAmount,
          currency: "usd",
          inventoryOnHand: v.inventoryOnHand,
          inventoryReserved: 0,
          active: true,
          imageUrl: v.imageUrl ?? product.imageUrls[0] ?? null,
        })
        .onConflictDoUpdate({
          target: variants.id,
          set: {
            sku: v.sku,
            color: v.color,
            size: v.size,
            unitAmount: v.unitAmount,
            imageUrl: v.imageUrl ?? product.imageUrls[0] ?? null,
            active: true,
            updatedAt: new Date(),
            // Do not overwrite inventory on re-seed
          },
        });
    }
  }

  console.log(`Seeded ${catalog.length} products.`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
