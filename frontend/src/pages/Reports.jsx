import { useEffect, useState } from 'react';
import api from '../services/api';

export function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/reports/summary')
      .then(({ data: d }) => setData(d))
      .catch((e) => setError(e.response?.data?.message || 'Could not load report'));
  }, []);

  return (
    <div className="page">
      <h1>Reconciliation report</h1>
      <p>Aggregated totals for MES oversight — permits by status, provincial seedling quantities, and survival averages.</p>
      {error && <div className="alert alert-error">{error}</div>}
      {data && (
        <>
          <section className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Generated {new Date(data.generatedAt).toLocaleString()}</p>
            <div className="grid-cards" style={{ marginTop: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1rem' }}>Planting sites</h2>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{data.plantingSiteCount}</p>
              </div>
              <div>
                <h2 style={{ fontSize: '1rem' }}>Total seedlings (qty)</h2>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{data.seedlingTotals?.totalQuantity ?? 0}</p>
              </div>
              <div>
                <h2 style={{ fontSize: '1rem' }}>Avg survival %</h2>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
                  {data.seedlingTotals?.avgSurvivalRatePercent ?? '—'}
                </p>
              </div>
            </div>
          </section>
          <section className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Permits by status</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--gt-slate-200)' }}>
                  <th style={{ padding: '0.5rem 0' }}>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {(data.permitsByStatus || []).map((row) => (
                  <tr key={row._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.45rem 0' }}>{row._id}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="glass-panel" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Seedlings by province</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--gt-slate-200)' }}>
                  <th style={{ padding: '0.5rem 0' }}>Province</th>
                  <th>Sites</th>
                  <th>Total qty</th>
                </tr>
              </thead>
              <tbody>
                {(data.seedlingsByProvince || []).map((row) => (
                  <tr key={row.province} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.45rem 0' }}>{row.province}</td>
                    <td>{row.siteCount}</td>
                    <td>{row.totalQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
