import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { CONTINENTS, getContinent } from '../utils/continents';
import '../App.css';

export default function PackageList() {
  const [allPackages, setAllPackages] = useState([]);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const destination = searchParams.get('destination') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const continent = searchParams.get('continent') || '';

  useEffect(() => {
    async function load() {
      try {
        setAllPackages(await api.get('/packages'));
        setError(null);
      } catch (e) { setError(e.message); }
    }
    load();
  }, []);

  const packages = allPackages.filter(p => {
    const destMatch = !destination || p.destination.toLowerCase().includes(destination.toLowerCase()) ||
                      p.title.toLowerCase().includes(destination.toLowerCase());
    const priceMatch = !maxPrice || Number(p.price_per_person) <= Number(maxPrice);
    const contMatch = !continent || getContinent(p.destination) === continent;
    return destMatch && priceMatch && contMatch;
  });

  function handleChange(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params);
  }

  return (
    <div className="page">
      <div className="packages-hero">
        <h1 className="packages-hero__title">All Packages</h1>
        <div className="search-bar">
          <input
            placeholder="Destination"
            value={destination}
            onChange={e => handleChange('destination', e.target.value)}
          />
          <input
            placeholder="Max price (£)"
            type="number"
            value={maxPrice}
            onChange={e => handleChange('maxPrice', e.target.value)}
          />
          <select value={continent} onChange={e => handleChange('continent', e.target.value)}>
            <option value="">All continents</option>
            {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <main className="main">
        {error && <p className="error-msg">{error}</p>}
        {!error && (
          <p className="results-count">
            {packages.length} package{packages.length !== 1 ? 's' : ''} found
          </p>
        )}
        <div className="package-grid">
          {packages.length === 0 && !error ? (
            <div className="empty-state">
              <p>🌍</p>
              <p>No packages found. Try a different search.</p>
            </div>
          ) : packages.map(p => (
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
                  £{Number(p.price_per_person).toLocaleString()} <span>/ person</span>
                </div>
                <Link to={`/packages/${p.id}`} className="btn-view">View</Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
