import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { user } = useAuth();
  return (
    <div className="page">
      <section className="glass-panel" style={{ padding: '2rem 1.5rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}>
          GreenTrace — custodial chain &amp; geospatial mapping for DENR seedling reconciliation
        </h1>
        <p style={{ maxWidth: '62ch', fontSize: '1.05rem' }}>
          Trace DENR seedlings from permits to planting sites. Role-based workflows support FRU permitting, NGP field
          operations, and MES reconciliation reporting — with OpenStreetMap-backed maps and EXIF-aware photo evidence.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-ghost">
                Register (NGP field account)
              </Link>
            </>
          )}
        </div>
      </section>
      <div className="grid-cards">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h2>FRU</h2>
          <p>Issue and maintain permits, species caps, and custodial metadata.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h2>NGP</h2>
          <p>Record seedlings, link batches to permits, and geotag planting sites.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h2>MES</h2>
          <p>View aggregates, provincial roll-ups, and survival indicators for reconciliation.</p>
        </div>
      </div>
    </div>
  );
}
