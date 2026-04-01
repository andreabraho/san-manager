import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Icon components ────────────────────────────────────────────────────────────
function IconBookings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconLocation() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconService() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

const QUICK_LINKS = [
  { label: 'Manage Bookings',  to: '/provider/bookings',     desc: 'Approve or reject incoming requests', Icon: IconBookings },
  { label: 'Locations',        to: '/provider/locations',    desc: 'Add and edit your locations',          Icon: IconLocation },
  { label: 'Services',         to: '/provider/services',     desc: 'Define the services you offer',        Icon: IconService },
  { label: 'Availability',     to: '/provider/availability', desc: 'Set your recurring or one-off slots',  Icon: IconClock },
  { label: 'Home Editor',      to: '/provider/home-editor',  desc: 'Customize your public page',           Icon: IconEdit },
];

export default function ProviderDashboard() {
  const { user } = useAuth();
  const name = user?.displayName || user?.username;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#111' }}>
          Hello{name ? `, ${name}` : ''}
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          What would you like to manage today?
        </p>
      </div>

      {/* Quick-link grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {QUICK_LINKS.map(({ label, to, desc, Icon }) => (
          <Link
            key={to}
            to={to}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: '20px 18px',
                background: '#fff',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                height: '100%',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ color: '#374151', marginBottom: 10 }}>
                <Icon />
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
