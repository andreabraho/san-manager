import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── Style tokens ──────────────────────────────────────────────────────────────
const S = {
  page: { maxWidth: 560, margin: '0 auto', padding: '40px 20px' },
  pageTitle: { fontSize: 22, fontWeight: 700, margin: '0 0 28px', color: '#111' },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 24,
    marginBottom: 20,
    background: '#fff',
  },
  cardTitle: { fontSize: 15, fontWeight: 600, margin: '0 0 20px', color: '#111' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, marginTop: 16 },
  labelFirst: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 },
  input: {
    display: 'block',
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box',
    background: '#fff',
    color: '#111',
    outline: 'none',
  },
  btnRow: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 },
  btn: {
    padding: '8px 20px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background 0.1s, opacity 0.1s',
  },
  savedMsg: { fontSize: 13, color: '#10b981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 },
  errorMsg: {
    fontSize: 13,
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '8px 12px',
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 2 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };

function FocusInput({ type = 'text', style, ...props }) {
  return (
    <input
      type={type}
      {...props}
      style={{ ...S.input, ...style }}
      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
      onBlur={(e)  => Object.assign(e.target.style, blurStyle)}
    />
  );
}

function SaveRow({ loading, saved, error }) {
  return (
    <div>
      {error && <div style={{ ...S.errorMsg, marginTop: 12 }}>{error}</div>}
      <div style={S.btnRow}>
        <button
          type="submit"
          disabled={loading}
          style={{ ...S.btn, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          onMouseEnter={(e) => { if (!loading) e.target.style.background = '#222'; }}
          onMouseLeave={(e) => { if (!loading) e.target.style.background = '#111'; }}
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
        {saved && (
          <span style={S.savedMsg}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: '40px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 20, height: 20, border: '2px solid #e5e7eb', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <span style={{ fontSize: 14, color: '#6b7280' }}>Loading profile...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);

  const [profileForm, setProfileForm] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    api.get('/me').then((res) => {
      setProfile(res.data);
      setProfileForm(res.data);
    });
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSaved(false);
    try {
      const res = await api.put('/me', profileForm);
      setProfile(res.data);
      setProfileForm(res.data);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Save failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSaved(false);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSaved(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const set = (key, value) => setProfileForm((f) => ({ ...f, [key]: value }));

  if (!profile) return <LoadingState />;

  const role = authUser?.role;

  return (
    <div style={S.page}>
      <h1 style={S.pageTitle}>Profile</h1>

      {/* Personal information */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Personal information</h2>
        <form onSubmit={handleProfileSubmit}>
          <label style={S.labelFirst}>Email</label>
          <FocusInput
            type="email"
            value={profileForm.email || ''}
            onChange={(e) => set('email', e.target.value)}
            required
          />

          {role === 'provider' && (
            <>
              <label style={S.label}>Display name</label>
              <FocusInput
                value={profileForm.displayName || ''}
                onChange={(e) => set('displayName', e.target.value)}
                required
              />
              <label style={S.label}>Phone <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <FocusInput
                value={profileForm.phone || ''}
                onChange={(e) => set('phone', e.target.value)}
              />
            </>
          )}

          {role === 'client' && (
            <>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={S.label}>First name</label>
                  <FocusInput
                    value={profileForm.firstName || ''}
                    onChange={(e) => set('firstName', e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={S.label}>Last name</label>
                  <FocusInput
                    value={profileForm.lastName || ''}
                    onChange={(e) => set('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>
              <label style={S.label}>Phone <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <FocusInput
                value={profileForm.phone || ''}
                onChange={(e) => set('phone', e.target.value)}
              />
            </>
          )}

          <SaveRow loading={profileLoading} saved={profileSaved} error={profileError} />
        </form>
      </div>

      {/* Change password */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Change password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <label style={S.labelFirst}>Current password</label>
          <FocusInput
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
            autoComplete="current-password"
          />
          <label style={S.label}>New password</label>
          <FocusInput
            type="password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
            required
            autoComplete="new-password"
          />
          <label style={S.label}>Confirm new password</label>
          <FocusInput
            type="password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            required
            autoComplete="new-password"
          />
          <SaveRow loading={pwLoading} saved={pwSaved} error={pwError} />
        </form>
      </div>
    </div>
  );
}
