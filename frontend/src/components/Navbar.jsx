import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isLoggedIn, isMember, isAdvisor, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">TripFinder</Link>

      <div className="navbar__links">
        <Link to="/packages" className="navbar__link">Packages</Link>
        {isAdvisor && <Link to="/admin" className="navbar__link">Admin</Link>}
      </div>

      <div className="navbar__auth">
        {isLoggedIn ? (
          <>
            {isMember && !isAdmin && (
              <span className="navbar__points">
                ⭐ {user.points_balance ?? 0} pts
              </span>
            )}
            {!isAdvisor && <Link to="/my-bookings" className="navbar__link">My Bookings</Link>}
            <span className="navbar__username">{user.name}</span>
            <button className="btn-outline" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-outline">Login</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
