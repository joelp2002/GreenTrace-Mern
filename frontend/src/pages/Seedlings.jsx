import { useEffect, useState } from 'react';
import api, { assetUrl } from '../services/api';
import { ExifPhotoPanel } from '../components/ExifPhotoPanel';
import { RoleGate } from '../components/RoleGate';

export function Seedlings() {
  const [rows, setRows] = useState([]);
  const [permits, setPermits] = useState([]);
  const [sites, setSites] = useState([]);
  const [form, setForm] = useState({
    species: '',
    quantity: 1,
    batchCode: '',
    sourceNursery: '',
    permit: '',
    plantingSite: '',
    plantedAt: '',
    condition: 'good',
    reconciliationNotes: '',
    photoUrl: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const [r, p, s] = await Promise.all([
      api.get('/seedlings'),
      api.get('/seedlings/permit-options'),
      api.get('/planting-sites'),
    ]);
    setRows(r.data);
    setPermits(p.data);
    setSites(s.data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || 'Load failed'));
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadPhoto() {
    if (!photoFile) return null;
    const fd = new FormData();
    fd.append('photo', photoFile);
    const { data } = await api.post('/upload', fd);
    return data.url;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      let photoUrl = form.photoUrl;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }
      await api.post('/seedlings', {
        ...form,
        quantity: Number(form.quantity),
        photoUrl: photoUrl || undefined,
        plantedAt: form.plantedAt || undefined,
      });
      setForm({
        species: '',
        quantity: 1,
        batchCode: '',
        sourceNursery: '',
        permit: form.permit,
        plantingSite: form.plantingSite,
        plantedAt: '',
        condition: 'good',
        reconciliationNotes: '',
        photoUrl: '',
      });
      setPhotoFile(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <h1>Seedlings</h1>
      <p>Batches linked to permits and planting sites (NGP and MES can create, edit, and delete).</p>
      {error && <div className="alert alert-error">{error}</div>}

      <RoleGate roles={['NGP', 'MES']}>
        <section className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h2>Record batch</h2>
          <form onSubmit={submit}>
            <div className="grid-cards">
              <div className="field">
                <label className="label">Species</label>
                <input className="input" value={form.species} onChange={(e) => set('species', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Quantity</label>
                <input className="input" type="number" min={1} step={1} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Batch code</label>
                <input className="input" value={form.batchCode} onChange={(e) => set('batchCode', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Permit (active)</label>
                <select className="input" value={form.permit} onChange={(e) => set('permit', e.target.value)} required>
                  <option value="">Select permit</option>
                  {permits
                    .filter((p) => p.status === 'active')
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.permitNumber} — {p.holderName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="field">
                <label className="label">Planting site</label>
                <select className="input" value={form.plantingSite} onChange={(e) => set('plantingSite', e.target.value)} required>
                  <option value="">Select site</option>
                  {sites.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.municipality})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label">Planted date</label>
                <input className="input" type="date" value={form.plantedAt} onChange={(e) => set('plantedAt', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Condition</label>
                <select className="input" value={form.condition} onChange={(e) => set('condition', e.target.value)}>
                  {['excellent', 'good', 'fair', 'poor', 'unknown'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Source nursery</label>
                <input className="input" value={form.sourceNursery} onChange={(e) => set('sourceNursery', e.target.value)} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Reconciliation notes</label>
                <textarea className="input" rows={2} value={form.reconciliationNotes} onChange={(e) => set('reconciliationNotes', e.target.value)} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Photo evidence</label>
                <input className="input" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save seedling batch'}
            </button>
          </form>
          <ExifPhotoPanel imageFile={photoFile} />
        </section>
      </RoleGate>

      
      <div className="grid-cards">
        {rows.map((r) => (
          <article key={r._id} className="glass-panel" style={{ padding: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>{r.species}</h3>
            <p style={{ margin: 0 }}>
              Qty: <strong>{r.quantity}</strong> · Batch: <strong>{r.batchCode}</strong>
            </p>
            <p style={{ fontSize: '0.85rem', margin: '0.35rem 0' }}>
              Permit: {r.permit?.permitNumber} · Site: {r.plantingSite?.name}
            </p>
            {r.photoUrl && (
              <img src={assetUrl(r.photoUrl)} alt="" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }} />
            )}
            <ExifPhotoPanel imageUrl={r.photoUrl} />
          </article>
        ))}
      </div>
    </div>
  );
}
