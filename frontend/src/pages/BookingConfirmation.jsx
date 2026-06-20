import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState(null);
  const { isMember, updatePoints, user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const [b, freshUser] = await Promise.all([
          api.get(`/bookings/${id}`),
          api.get('/auth/me'),
        ]);
        setBooking(b);
        const p = await api.get(`/packages/${b.package_id}`);
        setPkg(p);
        updatePoints(freshUser.points_balance);
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, [id]);

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  if (error) return (
    <div className="form-page">
      <p className="error-msg">{error}</p>
      <Link to="/my-bookings">Go to My Bookings</Link>
    </div>
  );

  if (!booking || !pkg) return (
    <div className="form-page"><p className="text-muted">Loading…</p></div>
  );

  return (
    <div className="confirm-page">
      <div className="confirm-card">

        <div className="confirm-card__banner">
          <div className="confirm-card__icon">✓</div>
          <h1 className="confirm-card__title">Booking confirmed!</h1>
          <p className="confirm-card__sub">
            Your adventure is booked. We can't wait to see you there.
          </p>
        </div>

        <div className="confirm-card__body">
          <div className="confirm-ref">
            <span className="confirm-ref__label">Reference</span>
            <span className="confirm-ref__value">TF-{String(booking.id).padStart(6, '0')}</span>
          </div>

          <div className="confirm-details">
            <div className="confirm-detail">
              <span className="confirm-detail__label">Package</span>
              <span className="confirm-detail__value">{pkg.title}</span>
            </div>
            <div className="confirm-detail">
              <span className="confirm-detail__label">Destination</span>
              <span className="confirm-detail__value">{pkg.destination}</span>
            </div>
            <div className="confirm-detail">
              <span className="confirm-detail__label">Departure</span>
              <span className="confirm-detail__value">{formatDate(pkg.departure_date)}</span>
            </div>
            <div className="confirm-detail">
              <span className="confirm-detail__label">Travellers</span>
              <span className="confirm-detail__value">{booking.travellers}</span>
            </div>
            <div className="confirm-detail">
              <span className="confirm-detail__label">Total paid</span>
              <span className="confirm-detail__value confirm-detail__value--price">
                £{Number(booking.total_price).toLocaleString()}
              </span>
            </div>
            <div className="confirm-detail">
              <span className="confirm-detail__label">Status</span>
              <span className={`status-badge status-badge--${booking.status}`}>{booking.status}</span>
            </div>
          </div>

          {/* Member points — Polymorphism evidence */}
          {isMember && booking.points_earned > 0 && (
            <div className="confirm-points">
              <span className="confirm-points__icon">⭐</span>
              <div>
                <p className="confirm-points__earned">+{booking.points_earned} points earned</p>
                <p className="confirm-points__balance">
                  New balance: {user?.points_balance ?? 0} pts
                </p>
              </div>
            </div>
          )}

          <div className="confirm-card__actions">
            <Link to="/my-bookings" className="btn-primary">View my bookings</Link>
            <Link to="/packages" className="btn-outline-dark">Browse more packages</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
