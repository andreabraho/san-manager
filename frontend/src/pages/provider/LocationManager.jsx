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
    background: '#fff',
  },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 },
  input: {
    display: 'block',
    width: '100%',
    marginBottom: 10,
    padding: '9px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fff',
    color: '#111',
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 2 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };

function FocusInput({ as: Tag = 'input', style, ...props }) {
  return (
    <Tag
      {...props}
      style={{ ...S.input, ...style }}
      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
      onBlur={(e)  => Object.assign(e.target.style, blurStyle)}
    />
  );
}

function Btn({ variant = 'primary', style, children, ...props }) {
  const base = {
    padding: '7px 14px',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background 0.1s, opacity 0.1s',
  };
  const variants = {
    primary: { background: '#111', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' },
    danger: { background: '#ef4444', color: '#fff', border: 'none' },
  };
  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = '#222';
        else if (variant === 'danger') e.currentTarget.style.background = '#dc2626';
        else e.currentTarget.style.background = '#f9fafb';
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = '#111';
        else if (variant === 'danger') e.currentTarget.style.background = '#ef4444';
        else e.currentTarget.style.background = '#fff';
      }}
    >
      {children}
    </button>
  );
}

const STATUS_META = {
  accepted: { color: '#065f46', bg: '#d1fae5', border: '#6ee7b7' },
  rejected: { color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
  pending:  { color: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
};

function ShareBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      fontSize: 11, padding: '2px 7px', borderRadius: 6, fontWeight: 500,
      color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
    }}>
      {status}
    </span>
  );
}

const EMPTY = { name: '', address: '', city: '', description: '' };

export default function LocationManager() {
  const [locations, setLocations] = useState([]);
  const [invites, setInvites] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [shareUsername, setShareUsername] = useState('');
  const [shareError, setShareError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get('/provider/locations').then((res) => setLocations(res.data));
  const loadInvites = () =>
    api.get('/provider/locations/share-invites').then((res) => setInvites(res.data));

  useEffect(() => {
    Promise.all([load(), loadInvites()]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/provider/locations/${editing}`, form);
    } else {
      await api.post('/provider/locations', form);
    }
    setForm(EMPTY);
    setEditing(null);
    load();
  };

  const startEdit = (loc) => {
    setForm({ name: loc.name, address: loc.address, city: loc.city, description: loc.description || '' });
    setEditing(loc._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    await api.delete(`/provider/locations/${id}`);
    load();
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setShareError('');
    try {
      await api.post(`/provider/locations/${shareTarget}/share`, { username: shareUsername });
      setShareTarget(null);
      setShareUsername('');
      load();
    } catch (err) {
      setShareError(err.response?.data?.message || 'Failed to share');
    }
  };

  const handleRemoveShare = async (locationId, providerId) => {
    await api.delete(`/provider/locations/${locationId}/share/${providerId}`);
    load();
  };

  const handleInviteResponse = async (locationId, response) => {
    await api.patch(`/provider/locations/${locationId}/share-response`, { response });
    loadInvites();
    load();
  };

  const ownLocations = locations.filter((l) => l.isOwner);
  const sharedLocations = locations.filter((l) => !l.isOwner);

  return (
    <div style={S.page}>
      <h1 style={S.pageTitle}>Locations</h1>

      {/* Pending invitations */}
      {invites.length > 0 && (
        <div style={{ border: '1px solid #fcd34d', borderRadius: 10, padding: 16, marginBottom: 24, background: '#fffbeb' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: '#92400e' }}>
            Pending invitations ({invites.length})
          </h2>
          {invites.map((loc) => (
            <div key={loc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{loc.name}</span>
                <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8 }}>
                  by {loc.provider?.displayName || loc.provider?.username}
                </span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}> · {loc.address}, {loc.city}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                <Btn variant="primary" onClick={() => handleInviteResponse(loc._id, 'accepted')}>Accept</Btn>
                <Btn variant="secondary" onClick={() => handleInviteResponse(loc._id, 'rejected')}>Decline</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit form */}
      <div style={S.formCard}>
        <h2 style={S.sectionTitle}>{editing ? 'Edit location' : 'Add location'}</h2>
        <form onSubmit={handleSubmit}>
          <FocusInput
            placeholder="Location name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FocusInput
            placeholder="Street address"
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <FocusInput
            placeholder="City"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <FocusInput
            as="textarea"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{ resize: 'vertical', marginBottom: 16 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn type="submit">{editing ? 'Update location' : 'Add location'}</Btn>
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
        <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>Loading locations...</p>
      )}

      {/* Empty state */}
      {!loading && ownLocations.length === 0 && sharedLocations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', border: '1px dashed #e5e7eb', borderRadius: 10 }}>
          <div style={{ fontSize: 14, color: '#374151', fontWeight: 500, marginBottom: 6 }}>No locations yet</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Add your first location using the form above.</div>
        </div>
      )}

      {/* Own locations */}
      {ownLocations.map((l) => (
        <div key={l._id} style={S.itemCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{l.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{l.address}, {l.city}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
              <Btn
                variant="secondary"
                onClick={() => { setShareTarget(l._id); setShareError(''); setShareUsername(''); }}
              >Share</Btn>
              <Btn variant="secondary" onClick={() => startEdit(l)}>Edit</Btn>
              <Btn variant="danger" onClick={() => handleDelete(l._id)}>Delete</Btn>
            </div>
          </div>

          {/* Shared-with list */}
          {l.sharedWith && l.sharedWith.length > 0 && (
            <div style={{ marginTop: 12, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                Shared with
              </div>
              {l.sharedWith.map((s) => (
                <div key={s.provider?._id || s._id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>
                    {s.provider?.displayName || s.provider?.username}
                  </span>
                  <ShareBadge status={s.status} />
                  <button
                    onClick={() => handleRemoveShare(l._id, s.provider?._id)}
                    style={{ fontSize: 12, padding: '1px 8px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 5, cursor: 'pointer', color: '#6b7280' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#dc2626'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Inline share form */}
          {shareTarget === l._id && (
            <form
              onSubmit={handleShare}
              style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}
            >
              <input
                value={shareUsername}
                onChange={(e) => setShareUsername(e.target.value)}
                placeholder="Provider username to invite"
                required
                style={{
                  padding: '7px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 13,
                  flex: 1,
                  minWidth: 160,
                  outline: 'none',
                }}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e)  => Object.assign(e.target.style, blurStyle)}
              />
              <Btn type="submit">Invite</Btn>
              <Btn variant="secondary" type="button" onClick={() => { setShareTarget(null); setShareError(''); }}>
                Cancel
              </Btn>
              {shareError && (
                <div style={{ width: '100%', fontSize: 12, color: '#dc2626', marginTop: 2 }}>{shareError}</div>
              )}
            </form>
          )}
        </div>
      ))}

      {/* Shared-with-me */}
      {sharedLocations.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: '28px 0 12px', color: '#111' }}>
            Shared with me
          </h2>
          {sharedLocations.map((l) => (
            <div key={l._id} style={{ ...S.itemCard, background: '#f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {l.name}
                    <span style={{ fontSize: 11, background: '#e0e7ff', color: '#3730a3', borderRadius: 5, padding: '1px 7px', fontWeight: 500 }}>
                      shared
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{l.address}, {l.city}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    Owner: {l.provider?.displayName || l.provider?.username}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
