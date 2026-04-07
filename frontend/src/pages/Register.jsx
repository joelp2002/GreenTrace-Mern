import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    organizationUnit: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 480 }}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h1>Register</h1>
        <p>
  Public registration creates an <span className="badge badge-ngp">NGP</span> account. Only an
  <span className="badge badge-admin" style={{ marginLeft: '0.35rem' }}>ADMIN</span> can create FRU, NGP, and MES staff accounts from the Staff page.
</p>
       
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label className="label" htmlFor="fullName">
              Full name
            </label>
            <input id="fullName" className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
          </div>
          <div className="field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">
              Password (min 8)
            </label>
            <input
              id="password"
              className="input"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="org">
              Organization / PENRO
            </label>
            <input id="org" className="input" value={form.organizationUnit} onChange={(e) => set('organizationUnit', e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
