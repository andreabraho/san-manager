import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminWidgetTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get('/admin/widget-types')
      .then((res) => setTypes(res.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const toggle = async (id, current) => {
    await api.patch(`/admin/widget-types/${id}/enabled`, { isEnabled: !current });
    load();
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#111' }}>Widget Types</h1>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 28px' }}>
        Enable or disable widget types platform-wide.
      </p>

      {loading && (
        <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>
          Loading widget types...
        </p>
      )}

      {!loading && types.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', border: '1px dashed #e5e7eb', borderRadius: 10 }}>
          <div style={{ fontSize: 14, color: '#374151', fontWeight: 500, marginBottom: 6 }}>No widget types found</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            Widget types are seeded when the backend starts.
          </div>
        </div>
      )}

      {!loading && types.map((t) => (
        <div
          key={t._id}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
              {t.label}
              <span style={{
                fontSize: 11,
                fontWeight: 500,
                padding: '1px 7px',
                borderRadius: 5,
                background: t.isEnabled ? '#d1fae5' : '#f3f4f6',
                color: t.isEnabled ? '#065f46' : '#6b7280',
                border: `1px solid ${t.isEnabled ? '#6ee7b7' : '#e5e7eb'}`,
              }}>
                {t.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {t.description && (
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>{t.description}</div>
            )}
          </div>
          <button
            onClick={() => toggle(t._id, t.isEnabled)}
            style={{
              padding: '6px 14px',
              background: t.isEnabled ? '#ef4444' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 500,
              flexShrink: 0,
              marginLeft: 12,
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = t.isEnabled ? '#dc2626' : '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = t.isEnabled ? '#ef4444' : '#10b981';
            }}
          >
            {t.isEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      ))}
    </div>
  );
}
