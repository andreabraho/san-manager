import BaseWidget from './BaseWidget';

// ── Edit-mode style tokens ────────────────────────────────────────────────────
const E = {
  wrap: { padding: 12, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' },
  input: {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    fontSize: 13,
    boxSizing: 'border-box',
    background: '#fff',
    color: '#111',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    fontSize: 13,
    boxSizing: 'border-box',
    background: '#fff',
    color: '#111',
    resize: 'vertical',
    outline: 'none',
    flex: 1,
    minHeight: 56,
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 1 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

// config: { imageUrl, name, role, bio, style }
const ProfileCard = ({ config = {}, isEditing, onConfigChange }) => {
  const { imageUrl = '', name = 'Your Name', role = 'Your role', bio = '' } = config;
  const textColor = config.style?.textColor;

  if (isEditing) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={E.wrap}>
          <div style={E.fieldLabel}>Profile photo URL</div>
          <input
            value={imageUrl}
            onChange={(e) => onConfigChange({ ...config, imageUrl: e.target.value })}
            placeholder="https://example.com/photo.jpg"
            style={E.input}
            {...fh}
          />
          <div style={E.fieldLabel}>Name</div>
          <input
            value={name}
            onChange={(e) => onConfigChange({ ...config, name: e.target.value })}
            placeholder="Jane Doe"
            style={E.input}
            {...fh}
          />
          <div style={E.fieldLabel}>Role / Title</div>
          <input
            value={role}
            onChange={(e) => onConfigChange({ ...config, role: e.target.value })}
            placeholder="Lead Stylist"
            style={E.input}
            {...fh}
          />
          <div style={E.fieldLabel}>Bio</div>
          <textarea
            value={bio}
            onChange={(e) => onConfigChange({ ...config, bio: e.target.value })}
            placeholder="Short bio..."
            rows={3}
            style={E.textarea}
            {...fh}
          />
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px', textAlign: 'center', height: '100%', boxSizing: 'border-box', fontFamily: config.style?.fontFamily || 'inherit' }}>
        <img
          src={imageUrl || 'https://placehold.co/100x100'}
          alt={name}
          style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 14 }}
        />
        <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: textColor }}>{name}</h3>
        {role && <p style={{ color: textColor || '#6b7280', margin: '0 0 10px', fontSize: 13 }}>{role}</p>}
        {bio && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: textColor }}>{bio}</p>}
      </div>
    </BaseWidget>
  );
};

export default ProfileCard;
