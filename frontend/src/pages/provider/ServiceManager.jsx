import { useEffect, useState } from 'react';
import api from '../../services/api';

// ── Style tokens ──────────────────────────────────────────────────────────────
const S = {
  page: { maxWidth: 720, margin: '0 auto', padding: '40px 20px' },
  pageTitle: { fontSize: 22, fontWeight: 700, margin: '0 0 24px', color: '#111' },
  sectionTitle: { fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#111' },
  formCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    background: '#fff',
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
  input: {
    display: 'block',
    width: '100%',
    marginBottom: 12,
    padding: '9px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fff',
    color: '#111',
  },
  smallInput: {
    display: 'block',
    width: 80,
    marginTop: 6,
    padding: '7px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    color: '#111',
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 2 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

function Btn({ variant = 'primary', style, children, ...props }) {
  const base = { padding: '7px 14px', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 };
  const variants = {
    primary:   { background: '#111', color: '#fff' },
    secondary: { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' },
    danger:    { background: '#ef4444', color: '#fff' },
  };
  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        if (variant === 'primary')   e.currentTarget.style.background = '#222';
        else if (variant === 'danger') e.currentTarget.style.background = '#dc2626';
        else e.currentTarget.style.background = '#f9fafb';
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary')   e.currentTarget.style.background = '#111';
        else if (variant === 'danger') e.currentTarget.style.background = '#ef4444';
        else e.currentTarget.style.background = '#fff';
      }}
    >
      {children}
    </button>
  );
}

const EMPTY = { name: '', description: '', durationMinutes: 60, maxPeople: 1, locations: [] };

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/provider/services').then((res) => setServices(res.data)),
      api.get('/provider/locations').then((res) => setLocations(res.data)),
    ]).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggleLocation = (id) => {
    const locs = form.locations.includes(id)
      ? form.locations.filter((l) => l !== id)
      : [...form.locations, id];
    setForm({ ...form, locations: locs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/provider/services/${editing}`, form);
    } else {
      await api.post('/provider/services', form);
    }
    setForm(EMPTY);
    setEditing(null);
    load();
  };

  const startEdit = (s) => {
    setForm({ ...s, locations: s.locations.map((l) => l._id) });
    setEditing(s._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await api.delete(`/provider/services/${id}`);
    load();
  };

  return (
    <div style={S.page}>
      <h1 style={S.pageTitle}>Services</h1>

      {/* Form */}
      <div style={S.formCard}>
        <h2 style={S.sectionTitle}>{editing ? 'Edit service' : 'Add service'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Service name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={S.input}
            {...fh}
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{ ...S.input, resize: 'vertical' }}
            {...fh}
          />

          <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              Duration (min)
              <input
                type="number"
                min={5}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                style={S.smallInput}
                {...fh}
              />
            </label>
            <label style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              Max people
              <input
                type="number"
                min={1}
                value={form.maxPeople}
                onChange={(e) => setForm({ ...form, maxPeople: Number(e.target.value) })}
                style={S.smallInput}
                {...fh}
              />
            </label>
          </div>

          {locations.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                Available at
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {locations.map((l) => {
                  const checked = form.locations.includes(l._id);
                  return (
                    <label
                      key={l._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
                        padding: '5px 10px', border: `1px solid ${checked ? '#111' : '#e5e7eb'}`,
                        borderRadius: 6, cursor: 'pointer', background: checked ? '#f3f4f6' : '#fff',
                        color: checked ? '#111' : '#374151', userSelect: 'none',
                      }}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleLocation(l._id)} style={{ margin: 0 }} />
                      {l.name}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn type="submit">{editing ? 'Update service' : 'Add service'}</Btn>
            {editing && (
              <Btn variant="secondary" type="button" onClick={() => { setForm(EMPTY); setEditing(null); }}>
                Cancel
              </Btn>
            )}
          </div>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>Loading services...</p>
      )}

      {/* Empty state */}
      {!loading && services.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', border: '1px dashed #e5e7eb', borderRadius: 10 }}>
          <div style={{ fontSize: 14, color: '#374151', fontWeight: 500, marginBottom: 6 }}>No services yet</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Add your first service using the form above.</div>
        </div>
      )}

      {/* Service list */}
      {services.map((s) => (
        <div key={s._id} style={S.itemCard}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{s.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
              {s.durationMinutes} min
              {s.maxPeople > 1 && ` · max ${s.maxPeople} people`}
              {s.locations.length > 0 && ` · ${s.locations.map((l) => l.name).join(', ')}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <Btn variant="secondary" onClick={() => startEdit(s)}>Edit</Btn>
            <Btn variant="danger" onClick={() => handleDelete(s._id)}>Delete</Btn>
          </div>
        </div>
      ))}
    </div>
  );
}
