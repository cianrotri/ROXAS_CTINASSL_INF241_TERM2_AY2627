import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import AuthScenery from '../components/AuthScenery';
import { ASSETS } from '../data/productThumbs';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    age: '',
    birthday: '',
    address: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/register', { ...form, age: Number(form.age) });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-register-page">
      <div className="auth-register-visual auth-meadow-bg" style={{ backgroundImage: `url(${ASSETS.background})` }}>
        <AuthScenery />
      </div>
      <main className="auth-register-form-panel">
        <div className="register-card mockup-register-card">
          <h1>REGISTER</h1>
          <form onSubmit={handleSubmit} className="register-form mockup-form">
            <label>
              full name
              <input name="fullName" value={form.fullName} onChange={onChange} required />
            </label>
            <div className="register-row">
              <label className="age-field">
                age
                <input type="number" name="age" value={form.age} onChange={onChange} min={1} required />
              </label>
              <label className="dob-field">
                date of birth
                <input type="date" name="birthday" value={form.birthday} onChange={onChange} required />
              </label>
            </div>
            <label>
              email
              <input type="email" name="email" value={form.email} onChange={onChange} required />
            </label>
            <label>
              password
              <input type="password" name="password" value={form.password} onChange={onChange} minLength={6} required />
            </label>
            <label>
              phone number
              <input name="phone" value={form.phone} onChange={onChange} required />
            </label>
            <label>
              address
              <input name="address" value={form.address} onChange={onChange} required />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-moss register-btn" disabled={submitting}>
              REGISTER
            </button>
          </form>
        </div>
        <Link to="/login" className="register-back-link">
          ← log in
        </Link>
      </main>
    </div>
  );
}