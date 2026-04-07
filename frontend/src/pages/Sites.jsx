import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { SitesMap } from '../components/SitesMap';
import { RoleGate } from '../components/RoleGate';

export function Sites() {
  const [sites, setSites] = useState([]);
  const [form, setForm] = useState({
    name: '',
    longitude: 121.774,
    latitude: 12.8797,
    address: '',
    municipality: '',
    province: '',
    region: '',
    areaHectares: '',
    establishedDate: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [params] = useSearchParams();
  const focus = params.get('focus');

  async function load() {
    const { data } = await api.get('/planting-sites');
    setSites(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || 'Failed to load sites'));
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/planting-sites', {
        ...form,
        location: {
          type: 'Point',
          coordinates: [Number(form.longitude), Number(form.latitude)],
        },
        areaHectares: form.areaHectares === '' ? undefined : Number(form.areaHectares),
        establishedDate: form.establishedDate || undefined,
      });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save site');
    } finally {
      setBusy(false);
    }
  }

  const focused = focus ? sites.find((s) => s._id === focus) : null;

  return (
    <div className="page">
      <h1>Planting sites &amp; map</h1>
      <p>GeoJSON points stored in MongoDB with 2dsphere indexing; NGP and MES can create, edit, and delete.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <RoleGate roles={['NGP', 'MES']}>
        <section className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h2>Add planting site</h2>
          <form onSubmit={submit}>
            <div className="grid-cards">
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Site name</label>
                <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Longitude</label>
                <input className="input" type="number" step="any" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Latitude</label>
                <input className="input" type="number" step="any" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} required />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Address</label>
                <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Municipality</label>
                <input className="input" value={form.municipality} onChange={(e) => set('municipality', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Province</label>
                <input className="input" value={form.province} onChange={(e) => set('province', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Region</label>
                <input className="input" value={form.region} onChange={(e) => set('region', e.target.value)} required placeholder="e.g. MIMAROPA" />
              </div>
              <div className="field">
                <label className="label">Area (ha)</label>
                <input className="input" type="number" min={0} step="any" value={form.areaHectares} onChange={(e) => set('areaHectares', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Established</label>
                <input className="input" type="date" value={form.establishedDate} onChange={(e) => set('establishedDate', e.target.value)} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Notes</label>
                <textarea className="input" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save site'}
            </button>
          </form>
        </section>
      </RoleGate>

      {focused && (
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <strong>Focused site:</strong> {focused.name} — {focused.municipality}, {focused.province}
        </div>
      )}

      <SitesMap sites={sites} />

      <section className="glass-panel" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h2 style={{ fontSize: '1rem' }}>All sites</h2>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
          {sites.map((s) => (
            <li key={s._id}>
              {s.name} — {s.municipality}, {s.province} [{s.location.coordinates[0].toFixed(4)},{' '}
              {s.location.coordinates[1].toFixed(4)}]
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
