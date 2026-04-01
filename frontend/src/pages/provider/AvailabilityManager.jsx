import { useEffect, useState } from 'react';
import api from '../../services/api';

// ── Style tokens ──────────────────────────────────────────────────────────────
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 4 },
  select: {
    padding: '9px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
    background: '#fff',
    color: '#111',
    outline: 'none',
    cursor: 'pointer',
  },
  dateInput: {
    padding: '9px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
    background: '#fff',
    color: '#111',
    outline: 'none',
  },
  errorBox: {
    fontSize: 13,
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '10px 12px',
    marginBottom: 16,
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 2 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

function Btn({ variant = 'primary', style, children, ...props }) {
  const base = { padding: '7px 14px', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 };
  const variants = {
    primary: { background: '#111', color: '#fff' },
    danger:  { background: '#ef4444', color: '#fff' },
  };
  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        if (variant === 'danger') e.currentTarget.style.background = '#dc2626';
        else e.currentTarget.style.background = '#222';
      }}
      onMouseLeave={(e) => {
        if (variant === 'danger') e.currentTarget.style.background = '#ef4444';
        else e.currentTarget.style.background = '#111';
      }}
    >
      {children}
    </button>
  );
}

const EMPTY = { location: '', type: 'recurring', dayOfWeek: 1, date: '', startTime: '09:00', endTime: '17:00', validFrom: '', validUntil: '' };

export default function AvailabilityManager() {
  const [availabilities, setAvailabilities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/provider/availability').then((res) => setAvailabilities(res.data));

  useEffect(() => {
    Promise.all([
      load(),
      api.get('/provider/locations').then((res) => setLocations(res.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/provider/availability', form);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save availability');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this availability slot?')) return;
    await api.delete(`/provider/availability/${id}`);
    load();
  };

  return (
    <div style={S.page}>
      <h1 style={S.pageTitle}>Availability</h1>

      {/* Form */}
      <div style={S.formCard}>
        <h2 style={S.sectionTitle}>Add availability slot</h2>
        <form onSubmit={handleSubmit}>
          {/* Location */}
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Location</label>
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
              style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}
              {...fh}
            >
              <option value="">Select a location</option>
              {locations.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}{!l.isOwner ? ' (shared)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Type toggle */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            {[
              { value: 'recurring', label: 'Recurring (weekly)' },
              { value: 'single',    label: 'Single date' },
            ].map(({ value, label }) => {
              const active = form.type === value;
              return (
                <label
                  key={value}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, cursor: 'pointer', color: active ? '#111' : '#6b7280', fontWeight: active ? 500 : 400 }}
                >
                  <input
                    type="radio"
                    value={value}
                    checked={active}
                    onChange={() => setForm({ ...form, type: value })}
                    style={{ accentColor: '#111' }}
                  />
                  {label}
                </label>
              );
            })}
          </div>

          {/* Recurring options */}
          {form.type === 'recurring' ? (
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <label style={S.label}>Day of week</label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
                  style={S.select}
                  {...fh}
                >
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Valid from</label>
                <input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  style={S.dateInput}
                  {...fh}
                />
              </div>
              <div>
                <label style={S.label}>Valid until</label>
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  style={S.dateInput}
                  {...fh}
                />
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                style={{ ...S.dateInput, display: 'block', width: '100%', boxSizing: 'border-box' }}
                {...fh}
              />
            </div>
          )}

          {/* Time range */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
              <label style={S.label}>Start time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                style={S.dateInput}
                {...fh}
              />
            </div>
            <div>
              <label style={S.label}>End time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                style={S.dateInput}
                {...fh}
              />
            </div>
          </div>

          {error && <div style={S.errorBox}>{error}</div>}

          <Btn type="submit">Add slot</Btn>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>Loading availability...</p>
      )}

      {/* Empty state */}
      {!loading && availabilities.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', border: '1px dashed #e5e7eb', borderRadius: 10 }}>
          <div style={{ fontSize: 14, color: '#374151', fontWeight: 500, marginBottom: 6 }}>No availability slots yet</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Add your first slot using the form above.</div>
        </div>
      )}

      {/* Availability list */}
      {availabilities.map((a) => (
        <div key={a._id} style={S.itemCard}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{a.location?.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
              {a.type === 'recurring'
                ? `Every ${DAYS[a.dayOfWeek]}`
                : new Date(a.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}{a.startTime}–{a.endTime}
              {a.type === 'recurring' && a.validFrom && (
                <span style={{ marginLeft: 8, color: '#9ca3af' }}>
                  {new Date(a.validFrom).toLocaleDateString()} – {a.validUntil ? new Date(a.validUntil).toLocaleDateString() : 'ongoing'}
                </span>
              )}
            </div>
          </div>
          <Btn variant="danger" onClick={() => handleDelete(a._id)} style={{ flexShrink: 0, marginLeft: 12 }}>
            Delete
          </Btn>
        </div>
      ))}
    </div>
  );
}
