import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STAFF_CREATE_ROLES = ['FRU', 'NGP', 'MES'];
const USER_ROLE_OPTIONS = ['ADMIN', 'FRU', 'NGP', 'MES'];

export function Staff() {
  const { registerStaff } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    organizationUnit: '',
    role: 'FRU',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingRoleId, setUpdatingRoleId] = useState('');

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onCreateStaff(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await registerStaff(form);
      setForm({
        email: '',
        password: '',
        fullName: '',
        organizationUnit: '',
        role: 'FRU',
      });
      await loadUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create staff account');
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateRole(userId, role) {
    setUpdatingRoleId(userId);
    setError('');
    try {
      await api.patch(`/auth/users/${userId}/role`, { role });
      await loadUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingRoleId('');
    }
  }

  return (
    <div className="page">
      <h1>Staff</h1>
      <p>ADMIN manages staff accounts and roles.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h2>Create staff account</h2>
        <p style={{ marginTop: 0, fontSize: '0.9rem' }}>
          ADMIN can create FRU, NGP, and MES accounts from this page.
        </p>
        <form onSubmit={onCreateStaff}>
          <div className="grid-cards">
            <div className="field">
              <label className="label">Full name</label>
              <input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="label">Organization unit</label>
              <input
                className="input"
                value={form.organizationUnit}
                onChange={(e) => set('organizationUnit', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => set('role', e.target.value)}>
                {STAFF_CREATE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create staff account'}
          </button>
        </form>
      </section>

      <section className="glass-panel" style={{ padding: '1.25rem' }}>
        <h2>All users</h2>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Organization</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={{ padding: '0.5rem' }}>{user.fullName}</td>
                    <td style={{ padding: '0.5rem' }}>{user.email}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <select
                        className="input"
                        value={user.role}
                        onChange={(e) => onUpdateRole(user._id, e.target.value)}
                        disabled={updatingRoleId === user._id}
                      >
                        {USER_ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '0.5rem' }}>{user.organizationUnit || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}