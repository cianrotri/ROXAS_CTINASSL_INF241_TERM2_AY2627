import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ShippingLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-orange-shell">
      <div className="admin-logout-row">
        <button
          type="button"
          className="admin-logout-chip"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          LOGOUT
        </button>
      </div>
      <Outlet />
    </div>
  );
}