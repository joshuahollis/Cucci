
export type Product = {
  id: number;
  name: string;
  price: number;
  category: 'intimates' | 'sweatsuits' | 'basics' | 'care';
  colors: { name: string; hex: string }[];
  image: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: 'CUCCI Cotton Brief',
    price: 25,
    category: 'intimates',
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Nude', hex: '#D2B48C' },
    ],
    image: '/product-placeholder.png',
  },
  {
    id: 2,
    name: 'CUCCI Soft Triangle Bra',
    price: 45,
    category: 'intimates',
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Dust', hex: '#B2A89F' },
    ],
    image: '/product-placeholder.png',
  },
  {
    id: 3,
    name: 'CUCCI Ribbed Tank',
    price: 35,
    category: 'basics',
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Heather Grey', hex: '#D3D3D3' },
    ],
    image: '/product-placeholder.png',
  },
  {
    id: 4,
    name: 'CUCCI Lounge Short',
    price: 60,
    category: 'sweatsuits',
    colors: [
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Bone', hex: '#E3DAC9' },
    ],
    image: '/product-placeholder.png',
  },
  {
    id: 5,
    name: 'CUCCI Core Sweatpant',
    price: 120,
    category: 'sweatsuits',
    colors: [
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Bone', hex: '#E3DAC9' },
      { name: 'Washed Black', hex: '#222222' },
    ],
    image: '/product-placeholder.png',
  },
  {
    id: 6,
    name: 'CUCCI Care Wash Bag',
    price: 15,
    category: 'care',
    colors: [{ name: 'Natural', hex: '#F5F5DC' }],
    image: '/product-placeholder.png',
  },
  {
    id: 7,
    name: 'CUCCI Silk Robe',
    price: 180,
    category: 'intimates',
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Champagne', hex: '#F7E7CE' },
    ],
    image: '/product-placeholder.png',
  },
  {
    id: 8,
    name: 'CUCCI Everyday Boxer',
    price: 30,
    category: 'intimates',
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Grey', hex: '#808080' },
    ],
    image: '/product-placeholder.png',
  },
  {
    id: 9,
    name: 'CUCCI Essential Tee',
    price: 40,
    category: 'basics',
    colors: [
      { name: 'Washed Black', hex: '#222222' },
      { name: 'Vintage White', hex: '#F5F5DC' },
    ],
    image: '/product-placeholder.png',
  },
];
