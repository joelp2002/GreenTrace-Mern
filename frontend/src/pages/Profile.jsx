import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [organizationUnit, setOrganizationUnit] = useState(user?.organizationUnit || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || '');
    setOrganizationUnit(user.organizationUnit || '');
    setEmail(user.email || '');
  }, [user]);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const payload = { fullName, organizationUnit, email };
      if (password) payload.password = password;
      await updateProfile(payload);
      setPassword('');
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <h1>Profile</h1>
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <p>
          Role: <span className={`badge badge-${user?.role?.toLowerCase() || 'ngp'}`}>{user?.role}</span>
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' }}>{message}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label className="label">Full name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="label">Organization unit</label>
            <input className="input" value={organizationUnit} onChange={(e) => setOrganizationUnit(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">New password (optional)</label>
            <input className="input" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
