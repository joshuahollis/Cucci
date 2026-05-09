
import React, { useState } from 'react';
import { Product } from '../data/products';

type ProductCardProps = {
  product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#f7f7f7',
        aspectRatio: '3 / 4',
        overflow: 'hidden',
        fontFamily: `'Helvetica Neue', 'Arial', sans-serif`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Placeholder for product image */}
      <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }} />

      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 400 }}>{product.name}</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>${product.price}</p>
        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          {product.colors.map(color => (
            <div
              key={color.name}
              style={{
                width: '15px',
                height: '15px',
                backgroundColor: color.hex,
                borderRadius: '50%',
                border: '1px solid #ddd'
              }}
            />
          ))}
        </div>
      </div>

      {isHovered && (
        <button
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            padding: '10px 15px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #eee',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          Quick Add
        </button>
      )}
    </div>
  );
};

export default ProductCard;
