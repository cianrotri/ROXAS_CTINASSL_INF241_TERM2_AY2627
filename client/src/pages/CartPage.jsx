import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ChiikawaHeader from '../components/ChiikawaHeader';
import { useAuth } from '../context/AuthContext';

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'CASH ON\nDELIVERY', icon: '🚚' },
  { value: 'gcash', label: 'GCASH', icon: 'G' },
];

export default function CartPage() {
  const { user, refreshUser, refreshCartCount } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [payment, setPayment] = useState('gcash');
  const [profile, setProfile] = useState({ ...user });
  const [editing, setEditing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState('');

  const loadCart = async () => {
    const { data } = await api.get('/cart');
    setCart(data);
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (user) setProfile({ ...user });
  }, [user]);

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const saveProfile = async () => {
    const ok = window.confirm(
      'Update your personal information in our database? This will affect future orders.'
    );
    if (!ok) return;
    await api.put('/auth/me', {
      fullName: profile.fullName,
      age: profile.age,
      birthday: profile.birthday?.slice?.(0, 10) || profile.birthday,
      address: profile.address,
      phone: profile.phone,
    });
    await refreshUser();
    setEditing(false);
    setMessage('Profile updated.');
  };

  const checkout = async () => {
    if (!cart.items.length) {
      setMessage('Your cart is empty.');
      return;
    }
    setCheckingOut(true);
    try {
      await api.post('/orders/checkout', { paymentMethod: payment });
      await refreshCartCount();
      setMessage('Order placed!');
      setTimeout(() => navigate('/shop'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="cart-page mockup-cart-page">
      <ChiikawaHeader variant="cart" />
      <div className="cart-sheet">
        <section className="receipt-panel mockup-receipt">
          <h2>
            <span aria-hidden>🛒</span> YOUR CART
          </h2>
          <div className="cart-items-scroll">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>QUANTITY</th>
                  <th>PRICE</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.lineTotal)} PHP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="receipt-footer">
            <div className="receipt-total mockup-total">
              <span>TOTAL:</span>
              <strong>{formatPrice(cart.total)} PHP</strong>
            </div>
            <button type="button" className="btn-moss checkout-cta" onClick={checkout} disabled={checkingOut}>
              CHECK OUT
            </button>
          </div>
        </section>

        <aside className="checkout-aside mockup-aside">
          <p className="aside-label">MODE OF PAYMENT:</p>
          <div className="payment-tiles">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`payment-tile ${payment === opt.value ? 'active' : ''}`}
                onClick={() => setPayment(opt.value)}
              >
                <span className="pay-icon">{opt.icon}</span>
                <span className="pay-label">{opt.label}</span>
              </button>
            ))}
          </div>

          <p className="aside-label">YOUR DETAILS:</p>
          <div className="details-box">
            {editing ? (
              <div className="details-edit">
                <label>
                  NAME:
                  <input
                    value={profile.fullName || ''}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </label>
                <label>
                  PHONE NUMBER:
                  <input
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </label>
                <label>
                  ADDRESS:
                  <input
                    value={profile.address || ''}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </label>
                <button type="button" className="btn-edit" onClick={saveProfile}>
                  SAVE
                </button>
              </div>
            ) : (
              <>
                <p>
                  <span>NAME:</span> {profile.fullName}
                </p>
                <p>
                  <span>PHONE NUMBER:</span> {profile.phone}
                </p>
                <p>
                  <span>ADDRESS:</span> {profile.address}
                </p>
              </>
            )}
          </div>
          {!editing && (
            <button
              type="button"
              className="btn-edit corner"
              onClick={() => {
                const ok = window.confirm('Edit your saved profile details?');
                if (ok) setEditing(true);
              }}
            >
              EDIT
            </button>
          )}
          {message && <p className="form-note">{message}</p>}
        </aside>
      </div>
    </div>
  );
}