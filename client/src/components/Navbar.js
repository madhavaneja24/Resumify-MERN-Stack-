import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span>Resumify</span>
        </Link>

        <div className={styles.links}>
          {user ? (
            <>
              <Link to="/dashboard" className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}>Dashboard</Link>
              <Link to="/builder" className={`${styles.link} ${isActive('/builder') ? styles.active : ''}`}>Builder</Link>
              <Link to="/ats" className={`${styles.link} ${isActive('/ats') ? styles.active : ''}`}>ATS Checker</Link>
              <div className={styles.userChip}>
                <span>{user.name?.charAt(0).toUpperCase()}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
