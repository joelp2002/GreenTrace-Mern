import { Link } from 'react-router-dom';

const statusTone = {
  draft: '#64748b',
  active: '#15803d',
  expired: '#b45309',
  revoked: '#b91c1c',
  suspended: '#7c3aed',
};

export function PermitCard({ permit }) {
  const tone = statusTone[permit.status] || '#64748b';
  return (
    <article className="glass-panel" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{permit.permitNumber}</h3>
        <span
          className="badge"
          style={{ background: `${tone}22`, color: tone }}
        >
          {permit.status}
        </span>
      </div>
      <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
        Holder: <strong>{permit.holderName}</strong>
      </p>
      <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>
        {new Date(permit.issueDate).toLocaleDateString()} — {new Date(permit.expiryDate).toLocaleDateString()}
      </p>
      {permit.issuedBy && (
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gt-slate-600)' }}>
          Issued by: {permit.issuedBy.fullName} ({permit.issuedBy.role})
        </p>
      )}
      <Link to={`/permits?view=${permit._id}`} style={{ fontSize: '0.9rem', marginTop: '0.75rem', display: 'inline-block' }}>
        View reconciliation →
      </Link>
    </article>
  );
}
