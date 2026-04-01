import { useEffect, useState } from 'react';
import api from '../../services/api';

const STAT_CONFIG = [
  { key: 'totalProviders', label: 'Providers',      color: '#3b82f6', bg: '#eff6ff' },
  { key: 'totalClients',   label: 'Clients',         color: '#10b981', bg: '#f0fdf4' },
  { key: 'totalBookings',  label: 'Total bookings',  color: '#6366f1', bg: '#eef2ff' },
  { key: 'pendingBookings',label: 'Pending',          color: '#f59e0b', bg: '#fffbeb' },
];

function SkeletonCard() {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px', background: '#fff' }}>
      <div style={{ width: 48, height: 32, background: '#f3f4f6', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ width: 80, height: 14, background: '#f3f4f6', borderRadius: 4, animation: 'pulse 1.4s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>Dashboard</h1>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 28px' }}>Platform overview</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : stats
            ? STAT_CONFIG.map(({ key, label, color, bg }) => (
                <div
                  key={key}
                  style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px', background: '#fff' }}
                >
                  <div style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color,
                    marginBottom: 6,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {stats[key] ?? 0}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
                </div>
              ))
            : null
        }
      </div>
    </div>
  );
}
