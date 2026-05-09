
import React, { useState, useEffect } from 'react';
import { products, Product } from '../data/products';
import ProductCard from './ProductCard';

const ProductGrid: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <main style={{ padding: isMobile ? '20px' : '40px 50px', backgroundColor: '#fff' }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}><option>Category</option></select>
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}><option>Size</option></select>
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}><option>Color</option></select>
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}><option>Price</option></select>
        </div>
        <div>
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}><option>Sort by Newest</option></select>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? '20px' : '40px',
        }}
      >
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
};

export default ProductGrid;
