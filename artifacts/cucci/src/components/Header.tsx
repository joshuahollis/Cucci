
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const navItems = ["Woman", "Man", "Collections", "Projects"];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        padding: isMobile ? '20px' : '30px 50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid #eee',
        fontFamily: `'Helvetica Neue', 'Arial', sans-serif`
      }}
    >
      <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '14px' }}>
        CUCCI
      </div>

      {!isMobile && (
        <nav style={{ display: 'flex', gap: '40px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em' }}>
          {navItems.map(item => (
            <a href="#" key={item} style={{ textDecoration: 'none', color: '#000' }}>{item}</a>
          ))}
        </nav>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '20px' : '30px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em' }}>
        <a href="#" style={{ textDecoration: 'none', color: '#000' }}>Search</a>
        <a href="#" style={{ textDecoration: 'none', color: '#000' }}>Account</a>
        <a href="#" style={{ textDecoration: 'none', color: '#000' }}>Cart (0)</a>
      </div>
    </header>
  );
};

export default Header;
