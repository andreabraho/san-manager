import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:   { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  approved:  { bg: '#10b981', color: '#fff',    label: 'Approved' },
  rejected:  { bg: '#ef4444', color: '#fff',    label: 'Rejected' },
  cancelled: { bg: '#6b7280', color: '#fff',    label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.cancelled;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 600,
      color: meta.color,
      background: meta.bg,
      borderRadius: 6,
      padding: '3px 9px',
      whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
}

// ── Booking card ─────────────────────────────────────────────────────────────
function BookingCard({ booking: b }) {
  const dateStr = b.date
    ? new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 10,
      background: '#fff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#111', marginBottom: 3 }}>
            {b.service?.name || 'Service'}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>
            {[b.provider?.displayName, b.location?.name].filter(Boolean).join(' · ')}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            {dateStr}{b.startTime ? ` at ${b.startTime}` : ''}
          </div>
          {(b.service?.durationMinutes != null || b.service?.price != null) && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              {b.service?.durationMinutes != null ? `Duration: ${b.service.durationMinutes} min` : ''}
              {b.service?.durationMinutes != null && b.service?.price != null ? ' · ' : ''}
              {b.service?.price != null ? `Price: €${b.service.price}` : ''}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, paddingTop: 2 }}>
          <StatusBadge status={b.status} />
        </div>
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid #e5e7eb',
        borderTopColor: '#111',
        borderRadius: '50%',
        margin: '0 auto 12px',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Loading bookings...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      border: '1px dashed #e5e7eb',
      borderRadius: 10,
      background: '#f9fafb',
    }}>
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ margin: '0 auto 14px', display: 'block' }}
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#374151', marginBottom: 6 }}>No bookings found</div>
      <div style={{ fontSize: 13, color: '#9ca3af' }}>
        We couldn't find any bookings matching your details.
      </div>
    </div>
  );
}

// ── Input component ───────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '9px 12px',
          fontSize: 14,
          border: '1px solid #e5e7eb',
          borderRadius: 6,
          background: '#fff',
          color: '#111',
          outline: focused ? '2px solid #3b82f6' : 'none',
          outlineOffset: 2,
          boxSizing: 'border-box',
          transition: 'border-color 0.1s',
        }}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isClient = user?.role === 'client';

  // Authenticated mode state
  const [authBookings, setAuthBookings] = useState([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Guest mode state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guestBookings, setGuestBookings] = useState(null); // null = not yet searched
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');
  const [submitHover, setSubmitHover] = useState(false);

  // Fetch immediately for authenticated clients
  useEffect(() => {
    if (!isClient) return;
    setAuthLoading(true);
    setAuthError('');
    api.get('/bookings/client')
      .then((res) => setAuthBookings(res.data))
      .catch(() => setAuthError('Failed to load your bookings. Please try again.'))
      .finally(() => setAuthLoading(false));
  }, [isClient]);

  const handleGuestLookup = async (e) => {
    e.preventDefault();
    if (!email.trim() || !firstName.trim() || !lastName.trim()) return;
    setGuestLoading(true);
    setGuestError('');
    setGuestBookings(null);
    try {
      const res = await api.post('/bookings/guest-lookup', { email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim() });
      setGuestBookings(res.data);
    } catch (err) {
      setGuestError(err?.response?.data?.message || 'Something went wrong. Please check your details and try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Top bar */}
      <div style={{
        height: 52,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            fontSize: 13,
            color: '#6b7280',
            cursor: 'pointer',
            padding: '4px 0',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#111'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>My Bookings</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>My Bookings</h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 28px' }}>
          {isClient ? 'Your booking history.' : 'Enter your details to look up your bookings.'}
        </p>

        <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 28 }} />

        {isClient ? (
          /* ── Authenticated mode ── */
          authLoading ? (
            <Spinner />
          ) : authError ? (
            <div style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 8,
              fontSize: 14,
              color: '#991b1b',
            }}>
              {authError}
            </div>
          ) : authBookings.length === 0 ? (
            <EmptyState />
          ) : (
            authBookings.map((b) => <BookingCard key={b._id} booking={b} />)
          )
        ) : (
          /* ── Guest lookup mode ── */
          <>
            <form onSubmit={handleGuestLookup}>
              <Field
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
              />
              <Field
                label="First name"
                value={firstName}
                onChange={setFirstName}
                placeholder="Jane"
              />
              <Field
                label="Last name"
                value={lastName}
                onChange={setLastName}
                placeholder="Smith"
              />

              <button
                type="submit"
                disabled={guestLoading || !email.trim() || !firstName.trim() || !lastName.trim()}
                onMouseEnter={() => setSubmitHover(true)}
                onMouseLeave={() => setSubmitHover(false)}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: guestLoading ? '#9ca3af' : (submitHover ? '#1d4ed8' : '#2563eb'),
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: guestLoading || !email.trim() || !firstName.trim() || !lastName.trim() ? 'not-allowed' : 'pointer',
                  opacity: (!email.trim() || !firstName.trim() || !lastName.trim()) && !guestLoading ? 0.6 : 1,
                  transition: 'background 0.1s',
                  marginTop: 4,
                }}
              >
                {guestLoading ? 'Searching...' : 'Find my bookings'}
              </button>
            </form>

            {guestError && (
              <div style={{
                marginTop: 20,
                padding: '12px 16px',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: 8,
                fontSize: 14,
                color: '#991b1b',
              }}>
                {guestError}
              </div>
            )}

            {guestBookings !== null && !guestError && (
              <div style={{ marginTop: 28 }}>
                <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 20 }} />
                {guestBookings.length === 0 ? (
                  <EmptyState />
                ) : (
                  guestBookings.map((b, i) => <BookingCard key={b._id || i} booking={b} />)
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
