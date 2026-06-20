import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function EditBooking() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [travellers, setTravellers] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, isMember, updatePoints } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { state: { returnTo: `/my-bookings/${id}/edit` } }); return; }
    async function load() {
      try {
        const b = await api.get(`/bookings/${id}`);
        if (b.status === 'cancelled') {
          navigate('/my-bookings');
          return;
        }
        setBooking(b);
        setTravellers(b.travellers);
        setBookingDate(b.booking_date.split('T')[0]);
        const p = await api.get(`/packages/${b.package_id}`);
        setPkg(p);
      } catch (e) { setError(e.message); }
    }
    load();
  }, [id, isLoggedIn, navigate]);

  const totalPrice = pkg ? (Number(pkg.price_per_person) * travellers).toFixed(2) : '0.00';
  const pointsPreview = isMember ? Math.floor(Number(totalPrice) / 100) : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.put(`/bookings/${id}`, {
        packageId: booking.package_id,
        travellers: Number(travellers),
        bookingDate,
      });
      const me = await api.get('/auth/me');
      updatePoints(me.points_balance);
      navigate('/my-bookings');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (error && !booking) return (
    <div className="form-page">
      <p className="error-msg">{error}</p>
      <Link to="/my-bookings">← Back to my bookings</Link>
    </div>
  );

  if (!booking || !pkg) return (
    <div className="form-page"><p className="text-muted">Loading…</p></div>
  );

  return (
    <div className="form-page">
      <Link to="/my-bookings" className="detail-back">← Back to my bookings</Link>

      <div className="form-layout">

        {/* Summary panel */}
        <div className="booking-summary">
          <div className="booking-summary__img">🌍</div>
          <div className="booking-summary__body">
            <p className="card__destination">{pkg.destination}</p>
            <h2 className="booking-summary__title">{pkg.title}</h2>
            <p className="booking-summary__price">
              £{Number(pkg.price_per_person).toLocaleString()} <span>/ person</span>
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Ref: TF-{String(booking.id).padStart(6, '0')}
            </p>
          </div>
        </div>

        {/* Edit form */}
        <div className="form-card">
          <h1 className="form-card__title">Edit booking</h1>

          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Number of travellers</label>
              <input className="form-input" type="number" min="1" max="20"
                value={travellers} onChange={e => setTravellers(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Booking date</label>
              <input className="form-input" type="date" value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} required />
            </div>

            {/* Updated price breakdown */}
            <div className="price-breakdown">
              <div className="price-breakdown__row">
                <span>£{Number(pkg.price_per_person).toLocaleString()} × {travellers} traveller{travellers != 1 ? 's' : ''}</span>
                <span>£{totalPrice}</span>
              </div>
              {isMember && (
                <div className="price-breakdown__row price-breakdown__points">
                  <span>⭐ Points you'll earn</span>
                  <span>+{pointsPreview} pts</span>
                </div>
              )}
              <div className="price-breakdown__total">
                <span>New total</span>
                <span>£{totalPrice}</span>
              </div>
            </div>

            <div className="edit-actions">
              <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Save changes'}
              </button>
              <Link to="/my-bookings" className="btn-outline-dark">Cancel</Link>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
