import { useEffect, useState } from 'react';
import api from '../../services/api';

// ── Style tokens ──────────────────────────────────────────────────────────────
const S = {
  page: { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },
  pageTitle: { fontSize: 22, fontWeight: 700, margin: 0, color: '#111' },
  formCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    background: '#fff',
  },
  sectionTitle: { fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#111' },
  input: {
    display: 'block',
    width: '100%',
    marginBottom: 10,
    padding: '9px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fff',
    color: '#111',
  },
  itemCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '14px 16px',
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: '#fff',
    flexWrap: 'wrap',
    gap: 8,
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 13,
    color: '#dc2626',
    marginBottom: 16,
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 2 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };

function FocusInput({ style, ...props }) {
  return (
    <input
      {...props}
      style={{ ...S.input, ...style }}
      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
      onBlur={(e)  => Object.assign(e.target.style, blurStyle)}
    />
  );
}

function Btn({ variant = 'primary', style, children, ...props }) {
  const base = { padding: '6px 13px', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' };
  const variants = {
    primary:   { background: '#111', color: '#fff' },
    secondary: { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' },
    danger:    { background: '#ef4444', color: '#fff' },
    success:   { background: '#10b981', color: '#fff' },
  };
  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        if (variant === 'danger')   e.currentTarget.style.background = '#dc2626';
        else if (variant === 'success') e.currentTarget.style.background = '#059669';
        else if (variant === 'primary') e.currentTarget.style.background = '#222';
        else e.currentTarget.style.background = '#f9fafb';
      }}
      onMouseLeave={(e) => {
        if (variant === 'danger')   e.currentTarget.style.background = '#ef4444';
        else if (variant === 'success') e.currentTarget.style.background = '#10b981';
        else if (variant === 'primary') e.currentTarget.style.background = '#111';
        else e.currentTarget.style.background = '#fff';
      }}
    >
      {children}
    </button>
  );
}

const PROVIDER_FIELDS = [
  { field: 'email',       label: 'Email',        type: 'text' },
  { field: 'password',    label: 'Password',     type: 'password' },
  { field: 'username',    label: 'Username',     type: 'text' },
  { field: 'displayName', label: 'Display name', type: 'text' },
  { field: 'phone',       label: 'Phone',        type: 'text', optional: true },
];

export default function AdminUsers() {
  const [tab, setTab] = useState('providers');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newProvider, setNewProvider] = useState({ email: '', password: '', username: '', displayName: '', phone: '' });
  const [createError, setCreateError] = useState('');

  const load = () => {
    setLoading(true);
    api.get(`/admin/${tab}`)
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const createProvider = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      await api.post('/auth/register/provider', newProvider);
      setShowCreate(false);
      setNewProvider({ email: '', password: '', username: '', displayName: '', phone: '' });
      load();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Creation failed.');
    }
  };

  const toggleActive = async (id, isActive) => {
    await api.patch(`/admin/users/${id}/active`, { isActive: !isActive });
    load();
  };

  const toggleImageApproval = async (id, current) => {
    await api.patch(`/admin/providers/${id}/approve-images`, { approved: !current });
    load();
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={S.pageTitle}>Users</h1>
        {tab === 'providers' && (
          <Btn
            variant={showCreate ? 'secondary' : 'primary'}
            style={{ fontSize: 13, padding: '7px 14px' }}
            onClick={() => { setShowCreate(!showCreate); setCreateError(''); }}
          >
            {showCreate ? 'Cancel' : '+ Create provider'}
          </Btn>
        )}
      </div>

      {/* Create form */}
      {showCreate && tab === 'providers' && (
        <div style={S.formCard}>
          <h2 style={S.sectionTitle}>New provider</h2>
          {createError && <div style={S.errorBox}>{createError}</div>}
          <form onSubmit={createProvider}>
            {PROVIDER_FIELDS.map(({ field, label, type, optional }) => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  {label}
                  {optional && <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: 4 }}>(optional)</span>}
                </label>
                <FocusInput
                  type={type}
                  placeholder={label}
                  required={!optional}
                  value={newProvider[field]}
                  onChange={(e) => setNewProvider({ ...newProvider, [field]: e.target.value })}
                />
              </div>
            ))}
            <Btn type="submit" style={{ padding: '8px 16px', fontSize: 14 }}>Create provider</Btn>
          </form>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
        {['providers', 'clients'].map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderBottom: active ? '2px solid #111' : '2px solid transparent',
                background: 'transparent',
                color: active ? '#111' : '#6b7280',
                fontWeight: active ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>
          Loading {tab}...
        </p>
      )}

      {/* Empty */}
      {!loading && users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', border: '1px dashed #e5e7eb', borderRadius: 10 }}>
          <div style={{ fontSize: 14, color: '#374151', fontWeight: 500, marginBottom: 6 }}>
            No {tab} found
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            {tab === 'providers'
              ? 'No provider accounts have been created yet.'
              : 'No client accounts have been created yet.'}
          </div>
        </div>
      )}

      {/* User list */}
      {!loading && users.map((u) => (
        <div key={u._id} style={S.itemCard}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>
              {u.displayName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>{u.email}</span>
              {tab === 'providers' && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '1px 7px',
                  borderRadius: 5,
                  background: u.canUploadImages ? '#d1fae5' : '#f3f4f6',
                  color: u.canUploadImages ? '#065f46' : '#6b7280',
                  border: `1px solid ${u.canUploadImages ? '#6ee7b7' : '#e5e7eb'}`,
                }}>
                  {u.canUploadImages ? 'Images approved' : 'Images pending'}
                </span>
              )}
              {!u.isActive && (
                <span style={{ fontSize: 11, fontWeight: 500, padding: '1px 7px', borderRadius: 5, background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
                  Disabled
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            {tab === 'providers' && (
              <Btn
                variant="secondary"
                onClick={() => toggleImageApproval(u._id, u.canUploadImages)}
              >
                {u.canUploadImages ? 'Revoke images' : 'Approve images'}
              </Btn>
            )}
            <Btn
              variant={u.isActive ? 'danger' : 'success'}
              onClick={() => toggleActive(u._id, u.isActive)}
            >
              {u.isActive ? 'Disable' : 'Enable'}
            </Btn>
          </div>
        </div>
      ))}
    </div>
  );
}
