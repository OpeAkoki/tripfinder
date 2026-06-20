import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', type: 'guest' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { customer, token } = await api.post('/auth/register', form);
      login(customer, token);
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Create an account</h1>
        <p className="auth-card__sub">Join TripFinder and start exploring</p>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" name="name" value={form.name}
              onChange={handle} placeholder="Jane Smith" required />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" name="email" type="email" value={form.email}
              onChange={handle} placeholder="jane@example.com" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" name="password" type="password" value={form.password}
              onChange={handle} placeholder="Min. 6 characters" minLength={6} required />
          </div>

          <div className="form-group">
            <label className="form-label">Account type</label>
            <div className="type-toggle">
              <label className={`type-option ${form.type === 'guest' ? 'type-option--active' : ''}`}>
                <input type="radio" name="type" value="guest" checked={form.type === 'guest'}
                  onChange={handle} />
                <span className="type-option__title">Guest</span>
                <span className="type-option__desc">Browse and book packages</span>
              </label>
              <label className={`type-option ${form.type === 'member' ? 'type-option--active' : ''}`}>
                <input type="radio" name="type" value="member" checked={form.type === 'member'}
                  onChange={handle} />
                <span className="type-option__title">Member ⭐</span>
                <span className="type-option__desc">Earn points on every booking</span>
              </label>
            </div>
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
