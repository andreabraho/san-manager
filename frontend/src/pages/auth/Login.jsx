import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// ── Shared style tokens ────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 32,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  heading: { fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: '#111' },
  subheading: { fontSize: 14, color: '#6b7280', margin: '0 0 24px' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 },
  input: {
    display: 'block',
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s',
    background: '#fff',
    color: '#111',
    marginBottom: 12,
  },
  btn: {
    width: '100%',
    padding: '10px 0',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 500,
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
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
  footer: { marginTop: 20, fontSize: 13, color: '#6b7280', textAlign: 'center' },
  link: { color: '#111', fontWeight: 600, textDecoration: 'none' },
};

// Focus ring helper — applied onFocus/onBlur via event handlers
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

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.user.role === 'provider' || data.user.role === 'superadmin') {
        setError('Please use the provider login at /provider/login');
        setLoading(false);
        return;
      }
      login(data.token, data.user);
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.heading}>Client login</h1>
        <p style={S.subheading}>Sign in to manage your bookings</p>

        {error && <div style={S.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={S.label}>Email</label>
          <FocusInput
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label style={S.label}>Password</label>
          <FocusInput
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{ marginBottom: 20 }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = '#222'; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = '#111'; }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={S.footer}>
          No account?{' '}
          <Link to="/register" style={S.link}>Create one</Link>
        </p>

        <p style={{ ...S.footer, marginTop: 8 }}>
          <Link to="/provider/login" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 12 }}>
            Are you a provider? Sign in here &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
