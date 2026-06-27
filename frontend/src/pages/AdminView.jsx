import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import '../App.css';

const EMPTY_PKG = { title: '', destination: '', description: '', price_per_person: '', departure_date: '', capacity: '', image_url: '' };

export default function AdminView() {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PKG);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pkgSearch, setPkgSearch] = useState('');
  const [pkgMaxPrice, setPkgMaxPrice] = useState('');
  const { isLoggedIn, isAdvisor, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!isAdvisor) { navigate('/'); return; }
    loadAll();
  }, [isLoggedIn, isAdvisor, navigate]);

  async function loadAll() {
    try {
      const [b, p] = await Promise.all([
        api.get('/bookings/all'),
        api.get('/packages'),
      ]);
      setBookings(b);
      setPackages(p);
    } catch (e) { setError(e.message); }
  }

  function handleFormChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setForm(f => ({ ...f, image_url: json.url }));
      setImagePreview(URL.createObjectURL(file));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function startCreate() {
    setEditing(null);
    setForm(EMPTY_PKG);
    setImagePreview('');
    setShowForm(true);
  }

  function startEdit(pkg) {
    setEditing(pkg.id);
    setImagePreview(pkg.image_url ? `http://localhost:3000${pkg.image_url}` : '');
    setForm({
      title: pkg.title,
      destination: pkg.destination,
      description: pkg.description ?? '',
      price_per_person: pkg.price_per_person,
      departure_date: pkg.departure_date.split('T')[0],
      capacity: pkg.capacity,
      image_url: pkg.image_url ?? '',
    });
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        price_per_person: Number(form.price_per_person),
        capacity: Number(form.capacity),
      };
      if (editing) {
        await api.put(`/packages/${editing}`, payload);
      } else {
        await api.post('/packages', payload);
      }
      setShowForm(false);
      setEditing(null);
      await loadAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmCancelBooking() {
    try {
      await api.del(`/bookings/${cancelTarget}`);
      setBookings(bs => bs.filter(b => b.id !== cancelTarget));
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelTarget(null);
    }
  }

  async function confirmDeletePkg() {
    try {
      await api.del(`/packages/${deleteTarget}`);
      setPackages(ps => ps.filter(p => p.id !== deleteTarget));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteTarget(null);
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function pastCutoff(b) {
    if (!b.package_departure_date) return false;
    const cutoff = new Date(b.package_departure_date);
    cutoff.setDate(cutoff.getDate() - 1);
    cutoff.setHours(23, 59, 0, 0);
    return new Date() >= cutoff;
  }

  return (
    <div className="list-page list-page--wide">

      {cancelTarget && (
        <ConfirmModal
          title="Cancel booking?"
          message="This will permanently cancel the booking and reverse any points earned. This cannot be undone."
          confirmLabel="Yes, cancel booking"
          danger
          onConfirm={confirmCancelBooking}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete package?"
          message="This will permanently delete the package and all associated bookings. This cannot be undone."
          confirmLabel="Yes, delete package"
          danger
          onConfirm={confirmDeletePkg}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="list-page__header">
        <h1 className="list-page__title">Admin Panel</h1>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'bookings' ? 'admin-tab--active' : ''}`}
          onClick={() => setTab('bookings')}>All Bookings ({bookings.length})</button>
        {isAdmin && (
          <button className={`admin-tab ${tab === 'packages' ? 'admin-tab--active' : ''}`}
            onClick={() => setTab('packages')}>Manage Packages ({packages.length})</button>
        )}
      </div>

      {/* ── All Bookings tab ── */}
      {tab === 'bookings' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Package</th>
                <th>Travellers</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="admin-table__ref">TF-{String(b.id).padStart(6, '0')}</td>
                  <td>{b.customer_name}</td>
                  <td>{b.package_title}</td>
                  <td>{b.travellers}</td>
                  <td>{formatDate(b.booking_date)}</td>
                  <td>£{Number(b.total_price).toLocaleString()}</td>
                  <td><span className={`status-badge status-badge--${b.status}`}>{b.status}</span></td>
                  <td>
                    {b.status !== 'cancelled' && !pastCutoff(b) && (
                      <button className="btn-sm btn-sm--cancel"
                        onClick={() => setCancelTarget(b.id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <p className="text-muted" style={{padding:'24px'}}>No bookings yet.</p>}
        </div>
      )}

      {/* ── Manage Packages tab ── */}
      {tab === 'packages' && isAdmin && (
        <div className={showForm ? 'admin-pkg-layout' : ''}>

          {/* Left: form panel (or add button above grid when closed) */}
          {showForm ? (
            <div className="admin-pkg-sidebar">
              <div className="form-card">
                <h2 className="form-card__title">{editing ? 'Edit package' : 'New package'}</h2>
                <form onSubmit={handleSave} className="auth-form">
                  <div className="admin-pkg-form-grid">
                    <div className="form-group form-group--full">
                      <label className="form-label">Title</label>
                      <input className="form-input" name="title" value={form.title} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group form-group--full">
                      <label className="form-label">Destination</label>
                      <input className="form-input" name="destination" value={form.destination} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price per person (£)</label>
                      <input className="form-input" name="price_per_person" type="number" min="0" step="0.01" value={form.price_per_person} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Capacity</label>
                      <input className="form-input" name="capacity" type="number" min="1" value={form.capacity} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group form-group--full">
                      <label className="form-label">Departure date</label>
                      <input className="form-input" name="departure_date" type="date" value={form.departure_date} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group form-group--full">
                      <label className="form-label">Description</label>
                      <textarea className="form-input" name="description" value={form.description} onChange={handleFormChange} rows={2} />
                    </div>
                    <div className="form-group form-group--full">
                      <label className="form-label">Package image</label>
                      <input type="file" accept="image/*" className="form-input"
                        onChange={handleImageUpload} disabled={uploading} />
                      {uploading && <p style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Uploading…</p>}
                      {imagePreview && (
                        <img src={imagePreview} alt="preview"
                          style={{marginTop:8,width:'100%',height:100,objectFit:'cover',borderRadius:6}} />
                      )}
                    </div>
                  </div>
                  <div className="edit-actions" style={{marginTop:16}}>
                    <button className="btn-submit" type="submit" disabled={saving} style={{width:'auto',padding:'10px 28px'}}>
                      {saving ? 'Saving…' : editing ? 'Save changes' : 'Create package'}
                    </button>
                    <button type="button" className="btn-outline-dark" onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <button className="btn-primary" style={{marginBottom: 20}} onClick={startCreate}>
              + Add a new package
            </button>
          )}

          {/* Right: search + tiles (or full width when form closed) */}
          <div>
            <div className="admin-pkg-search">
              <input
                className="form-input"
                placeholder="Search by destination or title…"
                value={pkgSearch}
                onChange={e => setPkgSearch(e.target.value)}
              />
              <input
                className="form-input"
                placeholder="Max price (£)"
                type="number"
                min="0"
                value={pkgMaxPrice}
                onChange={e => setPkgMaxPrice(e.target.value)}
              />
            </div>

            <div className="pkg-grid">
              {packages
                .filter(p => {
                  const q = pkgSearch.toLowerCase();
                  const nameMatch = !q || p.title.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q);
                  const priceMatch = !pkgMaxPrice || Number(p.price_per_person) <= Number(pkgMaxPrice);
                  return nameMatch && priceMatch;
                })
                .map(p => (
                <div key={p.id} className="pkg-tile">
                  {p.image_url
                    ? <img className="pkg-tile__img" src={p.image_url} alt={p.title} />
                    : <div className="pkg-tile__img-placeholder">🏖️</div>
                  }
                  <div className="pkg-tile__body">
                    <h3 className="pkg-tile__title">{p.title}</h3>
                    <p className="pkg-tile__meta">{p.destination}</p>
                    <p className="pkg-tile__meta">Departs {formatDate(p.departure_date)}</p>
                    <p className="pkg-tile__meta">{p.capacity} seats</p>
                    <p className="pkg-tile__price">£{Number(p.price_per_person).toLocaleString()} / person</p>
                  </div>
                  <div className="pkg-tile__actions">
                    <button className="btn-sm btn-sm--edit" onClick={() => startEdit(p)}>Update</button>
                    <button className="btn-sm btn-sm--cancel" onClick={() => setDeleteTarget(p.id)}>Delete Package</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
