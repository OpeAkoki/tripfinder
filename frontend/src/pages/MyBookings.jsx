import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import '../App.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState({});
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { isLoggedIn, isMember, updatePoints } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { state: { returnTo: '/my-bookings' } }); return; }
    async function load() {
      try {
        const [bList, pList] = await Promise.all([
          api.get('/bookings'),
          api.get('/packages'),
        ]);
        setBookings(bList);
        setPackages(Object.fromEntries(pList.map(p => [p.id, p])));
      } catch (e) { setError(e.message); }
    }
    load();
  }, [isLoggedIn, navigate]);

  async function confirmCancel() {
    try {
      await api.del(`/bookings/${cancelTarget}`);
      setBookings(bs => bs.filter(b => b.id !== cancelTarget));
      const me = await api.get('/auth/me');
      updatePoints(me.points_balance);
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelTarget(null);
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  return (
    <div className="list-page">
      {cancelTarget && (
        <ConfirmModal
          title="Cancel booking?"
          message="This will permanently cancel your booking. This cannot be undone."
          confirmLabel="Yes, cancel booking"
          danger
          onConfirm={confirmCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      <div className="list-page__header">
        <h1 className="list-page__title">My Bookings</h1>
        <Link to="/packages" className="btn-primary">+ New booking</Link>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {bookings.length === 0 && !error ? (
        <div className="empty-box">
          <p className="empty-box__icon">🧳</p>
          <p className="empty-box__text">No bookings yet.</p>
          <Link to="/packages" className="btn-primary">Browse packages</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(b => {
            const pkg = packages[b.package_id];
            const canEdit = b.status === 'pending' || b.status === 'confirmed';
            return (
              <div key={b.id} className="booking-row">
                <div className="booking-row__left">
                  <span className="booking-row__ref">TF-{String(b.id).padStart(6, '0')}</span>
                  <h3 className="booking-row__title">
                    {pkg ? pkg.title : `Package #${b.package_id}`}
                  </h3>
                  <p className="booking-row__meta">
                    {pkg?.destination} &middot; {b.travellers} traveller{b.travellers !== 1 ? 's' : ''} &middot; {formatDate(b.booking_date)}
                  </p>
                  {isMember && b.points_earned > 0 && (
                    <p className="booking-row__points">⭐ {b.points_earned} pts earned</p>
                  )}
                </div>

                <div className="booking-row__right">
                  <p className="booking-row__price">£{Number(b.total_price).toLocaleString()}</p>
                  <span className={`status-badge status-badge--${b.status}`}>{b.status}</span>
                  {canEdit && (
                    <div className="booking-row__actions">
                      <Link to={`/my-bookings/${b.id}/edit`} className="btn-sm btn-sm--edit">
                        Edit
                      </Link>
                      <button className="btn-sm btn-sm--cancel"
                        onClick={() => setCancelTarget(b.id)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
