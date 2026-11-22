import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthScenery from '../components/AuthScenery';
import { ASSETS } from '../data/productThumbs';
import { homePathForRole } from '../utils/roleHome';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(homePathForRole(user.role));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.request
            ? 'Cannot reach the server. In a terminal, run: cd server && npm run dev'
            : 'Login failed')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-login-page auth-meadow-bg" style={{ backgroundImage: `url(${ASSETS.background})` }}>
      <div className="auth-login-visual">
        <AuthScenery />
      </div>
      <div className="auth-login-form-slot">
        <div className="login-card mockup-login-card">
          <h1>LOG IN</h1>
          <form onSubmit={handleSubmit} className="stack-form mockup-form">
            <label>
              email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label>
              password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-moss wide" disabled={submitting}>
              ENTER
            </button>
          </form>
          <div className="login-links">
            <Link to="/register">register</Link>
            <button
              type="button"
              className="link-btn"
              onClick={() => alert('Please contact admin@chiikawa.shop to reset your password.')}
            >
              forgot password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}