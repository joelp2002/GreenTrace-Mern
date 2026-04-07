import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { PermitCard } from '../components/PermitCard';
import { RoleGate } from '../components/RoleGate';

const emptyForm = {
  permitNumber: '',
  issueDate: '',
  expiryDate: '',
  holderName: '',
  holderContact: '',
  status: 'draft',
  speciesAllowed: '',
  maxSeedlingCap: '',
  notes: '',
};

export function Permits() {
  const [permits, setPermits] = useState([]);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [params] = useSearchParams();
  const viewId = params.get('view');

  async function load() {
    const { data } = await api.get('/permits');
    setPermits(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || 'Failed to load permits'));
  }, []);

  useEffect(() => {
    if (!viewId) {
      setDetail(null);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get(`/permits/${viewId}`);
        setDetail(data);
      } catch (e) {
        setError(e.response?.data?.message || 'Permit not found');
      }
    })();
  }, [viewId]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function createPermit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const speciesAllowed = form.speciesAllowed
        ? form.speciesAllowed.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const payload = {
        ...form,
        speciesAllowed,
        maxSeedlingCap: form.maxSeedlingCap === '' ? undefined : Number(form.maxSeedlingCap),
      };
      await api.post('/permits', payload);
      setForm(emptyForm);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not create permit');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <h1>Permits</h1>
      <p>Forestland use / planting permits with issuing officer references.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <RoleGate roles={['FRU','MES']}>
        <section className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h2>Create permit</h2>
          <form onSubmit={createPermit}>
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              <div className="field">
                <label className="label">Permit #</label>
                <input className="input" value={form.permitNumber} onChange={(e) => set('permitNumber', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {['draft', 'active', 'expired', 'revoked', 'suspended'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label">Issue date</label>
                <input className="input" type="date" value={form.issueDate} onChange={(e) => set('issueDate', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Expiry date</label>
                <input className="input" type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} required />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Holder name</label>
                <input className="input" value={form.holderName} onChange={(e) => set('holderName', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Holder contact</label>
                <input className="input" value={form.holderContact} onChange={(e) => set('holderContact', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Max seedling cap</label>
                <input className="input" type="number" min={0} value={form.maxSeedlingCap} onChange={(e) => set('maxSeedlingCap', e.target.value)} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Species allowed (comma-separated)</label>
                <input className="input" value={form.speciesAllowed} onChange={(e) => set('speciesAllowed', e.target.value)} placeholder="Acacia, Mahogany" />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Notes</label>
                <textarea className="input" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save permit'}
            </button>
          </form>
        </section>
      </RoleGate>

      <RoleGate roles={['NGP', 'MES']}>
        <p className="glass-panel" style={{ padding: '0.75rem 1rem' }}>
          You can view permits. Only FRU and MES can create, edit, or delete permits.
        </p>
      </RoleGate>

      <div className="grid-cards">
        {permits.map((p) => (
          <PermitCard key={p._id} permit={p} />
        ))}
      </div>

      {detail && (
        <section className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
          <h2>Reconciliation — {detail.permit.permitNumber}</h2>
          <p>
            Linked seedling quantity: <strong>{detail.seedlingReconciliation?.totalQty ?? 0}</strong> across{' '}
            <strong>{detail.seedlingReconciliation?.batches ?? 0}</strong> batches.
          </p>
        </section>
      )}
    </div>
  );
}
