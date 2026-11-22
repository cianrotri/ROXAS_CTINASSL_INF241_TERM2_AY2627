import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StoreLogo from './StoreLogo';
import { ASSETS } from '../data/productThumbs';

export default function ChiikawaHeader({ variant = 'shop' }) {
  const { cartCount, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  if (variant === 'cart') {
    return (
      <header className="cart-top-bar">
        <button type="button" className="back-btn" onClick={() => navigate('/shop')}>
          <span className="back-icon" aria-hidden>
            ←
          </span>
          BACK
        </button>
        <div className="shop-header-brand">
          <StoreLogo className="header-compact" />
          <img src={ASSETS.headerCharacters} alt="" className="header-char-row" aria-hidden />
        </div>
      </header>
    );
  }

  return (
    <header className="shop-header">
      <div className="shop-header-brand">
        <StoreLogo className="header-compact" />
        <img src={ASSETS.headerCharacters} alt="" className="header-char-row" aria-hidden />
      </div>
      <nav className="shop-header-nav">
        <Link to="/cart" className="icon-nav-link">
          <svg className="nav-svg" viewBox="0 0 24 24" aria-hidden>
            <path d="M7 20a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 18h10l1.2-6H6.2L5 6H2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          CART
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
        <button type="button" className="icon-nav-link as-button" onClick={onLogout}>
          <svg className="nav-svg" viewBox="0 0 24 24" aria-hidden>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          LOGOUT
        </button>
      </nav>
    </header>
  );
}