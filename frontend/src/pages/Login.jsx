import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || '/';

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { customer, token } = await api.post('/auth/login', form);
      login(customer, token);
      navigate(returnTo, { replace: true });
    } catch (e) {
      setError(e.message);
      setForm(f => ({ ...f, password: '' }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__sub">Log in to your TripFinder account</p>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" name="email" type="email" value={form.email}
              onChange={handle} placeholder="jane@example.com" required autoFocus
              readOnly={!!error} style={error ? { background: '#f3f4f6', cursor: 'not-allowed' } : {}} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" name="password" type="password" value={form.password}
              onChange={handle} placeholder="Your password" required />
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-card__footer">
          No account yet? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
