import { NavLink } from 'react-router-dom';
import StoreLogo from './StoreLogo';

export default function AdminTopBar({ active }) {
  return (
    <header className="admin-top-bar">
      <nav className="admin-pill-nav" aria-label="Admin">
        <NavLink to="/admin/inventory" className={({ isActive }) => (isActive || active === 'inventory' ? 'active' : '')}>
          INVENTORY
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive || active === 'orders' ? 'active' : '')}>
          DELIVERY
        </NavLink>
      </nav>
      <StoreLogo />
    </header>
  );
}