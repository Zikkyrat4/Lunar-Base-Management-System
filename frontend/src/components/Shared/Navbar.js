import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/main.css';

const Navbar = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    setActiveItem(path);
    setIsMenuOpen(false);
  }, [location]);

  const menuItems = [
    { key: 'dashboard', label: 'Статистика', to: '/' },
    { key: 'map', label: 'Карта', to: '/map' },
    { key: 'logistics', label: 'Логистика', to: '/logistics' },
    { key: 'analytics', label: 'Аналитика', to: '/analytics' },
    { key: 'profile', label: 'Профиль', to: '/profile' }
  ];

  return (
    <nav className="custom-navbar">
      <div className="navbar-wrapper">
        
        <button
          className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          {menuItems.map(item => (
            <Link
              key={item.key}
              to={item.to}
              className={`nav-item ${activeItem === item.key ? 'active' : ''}`}
              onClick={() => {
                setActiveItem(item.key);
                setIsMenuOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="desktop-menu">
          {menuItems.map(item => (
            <Link
              key={item.key}
              to={item.to}
              className={`nav-item ${activeItem === item.key ? 'active' : ''}`}
              onClick={() => setActiveItem(item.key)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;