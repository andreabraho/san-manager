import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const name = user?.firstName || user?.username || '';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#111' }}>
          Hello{name ? `, ${name}` : ''}
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage your bookings here.</p>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        <Link to="/client/bookings" style={{ textDecoration: 'none' }}>
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '20px 18px',
              background: '#fff',
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
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
              <IconCalendar />
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 4 }}>My Bookings</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>View and track your booking history</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
