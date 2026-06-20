import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { CONTINENTS, getContinent } from '../utils/continents';
import '../App.css';

export default function Landing() {
  const [featured, setFeatured] = useState([]);
  const [destination, setDestination] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [continent, setContinent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFeatured() {
      try { setFeatured(await api.get('/packages')); } catch { /* silent */ }
    }
    loadFeatured();
  }, []);

  const isFiltering = destination.trim() !== '' || maxPrice !== '' || continent !== '';

  const displayed = isFiltering
    ? featured.filter(p => {
        const destMatch = !destination || p.destination.toLowerCase().includes(destination.toLowerCase()) ||
                          p.title.toLowerCase().includes(destination.toLowerCase());
        const priceMatch = !maxPrice || Number(p.price_per_person) <= Number(maxPrice);
        const contMatch = !continent || getContinent(p.destination) === continent;
        return destMatch && priceMatch && contMatch;
      })
    : featured.slice(0, 6);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.append('destination', destination);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (continent) params.append('continent', continent);
    navigate(`/packages?${params.toString()}`);
  }

  return (
    <div className="page">

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-section__content">
          <h1 className="hero-section__title">Find Your Next Adventure</h1>
          <p className="hero-section__subtitle">
            Smart travel booking, with rewards for members.
          </p>
          <Link to="/packages" className="btn-hero">Browse all packages</Link>
        </div>

        <form className="hero-search" onSubmit={handleSearch}>
          <input
            className="hero-search__input"
            placeholder="Destination"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          />
          <input
            className="hero-search__input"
            placeholder="Max price (£)"
            type="number"
            min="0"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
          <select className="hero-search__input" value={continent} onChange={e => setContinent(e.target.value)}>
            <option value="">All continents</option>
            {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn-search" type="submit">Search</button>
        </form>
      </section>

      {/* Featured packages */}
      <section className="featured">
        <div className="featured__header">
          <h2 className="featured__title">
            {isFiltering ? `${displayed.length} package${displayed.length !== 1 ? 's' : ''} found` : 'Featured Packages'}
          </h2>
          <Link to="/packages" className="featured__see-all">See all →</Link>
        </div>

        <div className="package-grid">
          {displayed.length === 0 && (
            <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No packages match your search.</p>
          )}
          {displayed.map(p => (
            <div key={p.id} className="card">
              {p.image_url
                ? <img src={p.image_url} alt={p.title} className="card__img" />
                : <div className="card__img">🌍</div>}
              <div className="card__body">
                <p className="card__destination">{p.destination}</p>
                <h3 className="card__title">{p.title}</h3>
                <p className="card__desc">{p.description}</p>
              </div>
              <div className="card__footer">
                <div className="card__price">
                  £{Number(p.price_per_person).toLocaleString()}
                  <span> / person</span>
                </div>
                <Link to={`/packages/${p.id}`} className="btn-view">View</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
