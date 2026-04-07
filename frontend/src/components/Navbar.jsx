import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleGate } from './RoleGate';
import './Navbar.css';

const linkClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link-active' : 'nav-link';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="nav-header glass-panel">
      <div className="nav-inner">
        <NavLink to="/dashboard" className="nav-brand">
          <img src="/favicon.svg" alt="GreenTrace logo" className="nav-brand-logo" />
          <span>
            <strong>GreenTrace</strong>
            <small>DENR Marinduque</small>
          </span>
        </NavLink>

        <nav className="nav-links" aria-label="Main">
          <RoleGate roles={['ADMIN', 'FRU', 'NGP', 'MES']}>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          </RoleGate>

          <RoleGate roles={['FRU', 'MES']}>
            <NavLink to="/permits" className={linkClass}>
              Permits
            </NavLink>
          </RoleGate>

          <RoleGate roles={['NGP', 'MES']}>
            <NavLink to="/seedlings" className={linkClass}>
              Seedlings
            </NavLink>
          </RoleGate>

          <RoleGate roles={['NGP', 'MES']}>
            <NavLink to="/sites" className={linkClass}>
              Sites &amp; map
            </NavLink>
          </RoleGate>

          <RoleGate roles={['ADMIN']}>
            <NavLink to="/staff" className={linkClass}>
              Staff
            </NavLink>
          </RoleGate>

          <RoleGate roles={['MES']}>
            <NavLink to="/reports" className={linkClass}>
              Reports
            </NavLink>
          </RoleGate>

          <RoleGate roles={['ADMIN', 'FRU', 'NGP', 'MES']}>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          </RoleGate>
        </nav>

        <div className="nav-user">
          {user ? (
            <>
              <span className={`badge badge-${user.role?.toLowerCase() || 'ngp'}`}>
                {user.role}
              </span>
              <button type="button" className="btn btn-ghost nav-logout" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary">
              Sign in
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}