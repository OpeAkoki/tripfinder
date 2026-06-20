import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function PackageDetail() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState(null);
  const { isLoggedIn, isMember, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try { setPkg(await api.get(`/packages/${id}`)); }
      catch (e) { setError(e.message); }
    }
    load();
  }, [id]);

  function handleBook() {
    if (!isLoggedIn) {
      navigate('/login', { state: { returnTo: `/packages/${id}/book` } });
    } else {
      navigate(`/packages/${id}/book`);
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  if (error) return (
    <div className="detail-page">
      <p className="error-msg">{error}</p>
      <Link to="/packages">← Back to packages</Link>
    </div>
  );

  if (!pkg) return <div className="detail-page"><p className="text-muted">Loading…</p></div>;

  const upgradeEligible = isMember && user?.points_balance >= 500;

  const bookingsClosed = (() => {
    if (!pkg) return false;
    const cutoff = new Date(pkg.departure_date);
    cutoff.setDate(cutoff.getDate() - 1);
    cutoff.setHours(23, 59, 0, 0);
    return new Date() >= cutoff;
  })();

  return (
    <div className="detail-page">
      <Link to="/packages" className="detail-back">← Back to packages</Link>

      <div className="detail-card">
        {pkg.image_url
          ? <img src={pkg.image_url} alt={pkg.title} className="detail-card__img" style={{objectFit:'cover'}} />
          : <div className="detail-card__img">🌍</div>}

        <div className="detail-card__body">
          <div className="detail-card__meta">
            <span className="card__destination">{pkg.destination}</span>
          </div>

          <h1 className="detail-card__title">{pkg.title}</h1>
          <p className="detail-card__desc">{pkg.description}</p>

          {/* Member-only upgrade hint — Polymorphism evidence */}
          {isMember && (
            <div className={`upgrade-hint ${upgradeEligible ? 'upgrade-hint--eligible' : ''}`}>
              {upgradeEligible
                ? '🌟 You have enough points to upgrade this booking!'
                : `⭐ You're a Member — earn 1 point for every £100 spent on this booking.`}
            </div>
          )}

          <div className="detail-card__stats">
            <div className="detail-stat">
              <span className="detail-stat__label">Price per person</span>
              <span className="detail-stat__value">£{Number(pkg.price_per_person).toLocaleString()}</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat__label">Departure</span>
              <span className="detail-stat__value">{formatDate(pkg.departure_date)}</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat__label">Seats left</span>
              <span className="detail-stat__value" style={{color: pkg.seats_left === 0 ? '#b91c1c' : pkg.seats_left <= 3 ? '#b45309' : 'inherit'}}>
                {pkg.seats_left === 0 ? 'Sold out' : `${pkg.seats_left} / ${pkg.capacity}`}
              </span>
            </div>
          </div>

          {isAdmin ? (
            <p className="detail-card__login-note" style={{color:'var(--text-muted)', fontStyle:'italic'}}>
              Admins manage packages but cannot make bookings.
            </p>
          ) : (
            <>
              <button className="btn-book" onClick={handleBook}
                disabled={pkg.seats_left === 0 || bookingsClosed}
                style={pkg.seats_left === 0 || bookingsClosed ? {opacity:0.5, cursor:'not-allowed'} : {}}>
                {pkg.seats_left === 0 ? 'Sold out' : bookingsClosed ? 'Bookings closed' : isLoggedIn ? 'Book now' : 'Log in to book'}
              </button>
              {bookingsClosed && (
                <p className="detail-card__login-note" style={{color:'#b91c1c'}}>
                  Bookings for this package closed at 11:59 PM the day before departure.
                </p>
              )}

              {!isLoggedIn && (
                <p className="detail-card__login-note">
                  <Link to="/login" state={{ returnTo: `/packages/${id}/book` }}>Log in</Link> or{' '}
                  <Link to="/register">register</Link> to book this package.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
