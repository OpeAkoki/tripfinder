import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function BookingForm() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [travellers, setTravellers] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, isMember, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { returnTo: `/packages/${id}/book` } });
      return;
    }
    if (isAdmin) {
      navigate(`/packages/${id}`);
      return;
    }
    async function load() {
      try { setPkg(await api.get(`/packages/${id}`)); }
      catch (e) { setError(e.message); }
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
      const booking = await api.post('/bookings', {
        packageId: Number(id),
        travellers: Number(travellers),
        bookingDate,
      });
      navigate(`/booking-confirmation/${booking.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (error && !pkg) return (
    <div className="form-page">
      <p className="error-msg">{error}</p>
      <Link to="/packages">← Back to packages</Link>
    </div>
  );

  if (!pkg) return <div className="form-page"><p className="text-muted">Loading…</p></div>;

  return (
    <div className="form-page">
      <Link to={`/packages/${id}`} className="detail-back">← Back to package</Link>

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
          </div>
        </div>

        {/* Booking form */}
        <div className="form-card">
          <h1 className="form-card__title">Complete your booking</h1>

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
                min={new Date().toISOString().split('T')[0]}
                max={(() => {
                  const d = new Date(pkg.departure_date);
                  d.setDate(d.getDate() - 1);
                  return d.toISOString().split('T')[0];
                })()}
                required />
            </div>

            {/* Price breakdown */}
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
                <span>Total</span>
                <span>£{totalPrice}</span>
              </div>
            </div>

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? 'Confirming…' : 'Confirm booking'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
