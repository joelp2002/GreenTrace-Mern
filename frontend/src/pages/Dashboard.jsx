import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState('');

  const isFRU = user?.role === 'FRU';
  const isNGP = user?.role === 'NGP';
  const isMES = user?.role === 'MES';
  const isADMIN = user?.role === 'ADMIN';

  useEffect(() => {
    let cancelled = false;

    // Only MES should load reconciliation report summary
    if (!isMES) {
      setSummary(null);
      setErr('');
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const { data } = await api.get('/reports/summary');
        if (!cancelled) {
          setSummary(data);
          setErr('');
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e.response?.data?.message || 'Could not load summary');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isMES]);

  return (
    <div className="page">
      <h1>Welcome, {user?.fullName}</h1>
      <p>
        Role: <span className={`badge badge-${user?.role?.toLowerCase() || 'ngp'}`}>{user?.role}</span>
      </p>

      {err && <div className="alert alert-error">{err}</div>}

      {isMES && summary && (
        <section className="grid-cards" style={{ marginTop: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h2>Planting sites</h2>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{summary.plantingSiteCount}</p>
            <Link to="/sites">Manage sites</Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h2>Seedlings tracked</h2>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
              {summary.seedlingTotals?.totalQuantity ?? 0}
            </p>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              {summary.seedlingTotals?.recordCount ?? 0} batch records
            </p>
            <Link to="/seedlings">View seedlings</Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h2>Permits</h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.9rem' }}>
              {(summary.permitsByStatus || []).map((x) => (
                <li key={x._id}>
                  {x._id}: <strong>{x.count}</strong>
                </li>
              ))}
            </ul>
            <Link to="/permits">Open permits</Link>
          </div>
        </section>
      )}

      <section className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
        <h2>Quick actions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {isFRU && (
            <Link to="/permits" className="btn btn-primary">
              New permit
            </Link>
          )}

          {isNGP && (
            <>
              <Link to="/seedlings" className="btn btn-ghost">
                Log seedlings
              </Link>
              <Link to="/sites" className="btn btn-ghost">
                Map sites
              </Link>
            </>
          )}

          {isMES && (
            <>
              <Link to="/permits" className="btn btn-primary">
                Open permits
              </Link>
              <Link to="/seedlings" className="btn btn-ghost">
                Log seedlings
              </Link>
              <Link to="/sites" className="btn btn-ghost">
                Map sites
              </Link>
              <Link to="/reports" className="btn btn-ghost">
                Reconciliation report
              </Link>
            </>
          )}

          {isADMIN && (
            <>
              <Link to="/staff" className="btn btn-primary">
                Staff
              </Link>
            </>
          )}

          <Link to="/profile" className="btn btn-ghost">
            Profile
          </Link>
        </div>
      </section>
    </div>
  );
}