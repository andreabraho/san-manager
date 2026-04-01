import { useEffect, useState } from 'react';
import api from '../../services/api';

// ── Style tokens ──────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:   { color: '#b45309', bg: '#fef3c7', border: '#fcd34d', label: 'Pending' },
  approved:  { color: '#065f46', bg: '#d1fae5', border: '#6ee7b7', label: 'Approved' },
  rejected:  { color: '#991b1b', bg: '#fee2e2', border: '#fca5a5', label: 'Rejected' },
  cancelled: { color: '#374151', bg: '#f3f4f6', border: '#d1d5db', label: 'Cancelled' },
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
      border: `1px solid ${meta.border}`,
      borderRadius: 6,
      padding: '2px 8px',
      whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#111', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Loading your bookings...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/client')
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px', color: '#111' }}>My Bookings</h1>

      {loading ? (
        <LoadingState />
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px dashed #e5e7eb', borderRadius: 10 }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', display: 'block' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#374151', marginBottom: 6 }}>No bookings yet</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            Your booking history will appear here once you make a booking.
          </div>
        </div>
      ) : (
        bookings.map((b) => (
          <div
            key={b._id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              background: '#fff',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: '#111' }}>
                {b.service?.name}
                {b.provider?.displayName && (
                  <span style={{ fontWeight: 400, color: '#6b7280' }}> with {b.provider.displayName}</span>
                )}
              </div>
              {b.location?.name && (
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  {b.location.name}{b.location.city ? `, ${b.location.city}` : ''}
                </div>
              )}
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                {new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {b.startTime}
              </div>
            </div>
            <div style={{ marginLeft: 16, flexShrink: 0 }}>
              <StatusBadge status={b.status} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
