import BaseWidget from './BaseWidget';

const PLATFORMS = [
  { value: 'instagram',  label: 'Instagram',   color: '#E1306C', icon: 'IG' },
  { value: 'facebook',   label: 'Facebook',    color: '#1877F2', icon: 'FB' },
  { value: 'x',          label: 'X / Twitter', color: '#000000', icon: 'X'  },
  { value: 'tiktok',     label: 'TikTok',      color: '#010101', icon: 'TT' },
  { value: 'youtube',    label: 'YouTube',     color: '#FF0000', icon: 'YT' },
  { value: 'linkedin',   label: 'LinkedIn',    color: '#0A66C2', icon: 'LI' },
  { value: 'whatsapp',   label: 'WhatsApp',    color: '#25D366', icon: 'WA' },
  { value: 'telegram',   label: 'Telegram',    color: '#229ED9', icon: 'TG' },
  { value: 'pinterest',  label: 'Pinterest',   color: '#E60023', icon: 'PT' },
  { value: 'snapchat',   label: 'Snapchat',    color: '#FFFC00', icon: 'SC' },
  { value: 'website',    label: 'Website',     color: '#6b7280', icon: 'WW' },
  { value: 'other',      label: 'Other',       color: '#9ca3af', icon: '?'  },
];

const getPlatform = (value) =>
  PLATFORMS.find((p) => p.value === value) || PLATFORMS[PLATFORMS.length - 1];

const EMPTY_LINK = { platform: 'instagram', url: '', label: '' };

// ── Edit-mode style tokens ────────────────────────────────────────────────────
const E = {
  input: {
    padding: '5px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    fontSize: 12,
    boxSizing: 'border-box',
    background: '#fff',
    color: '#111',
    outline: 'none',
  },
  select: {
    padding: '5px 6px',
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    fontSize: 12,
    background: '#fff',
    color: '#374151',
    outline: 'none',
    cursor: 'pointer',
  },
  addBtn: {
    padding: '5px 12px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
  },
  removeBtn: {
    padding: '3px 8px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: 4,
    fontSize: 11,
    cursor: 'pointer',
    flexShrink: 0,
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 1 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

// config: { links: [{ platform, url, label }], layout: 'row'|'grid', showLabels: boolean, style }
const SocialLinks = ({ config = {}, isEditing, onConfigChange }) => {
  const { links = [], layout = 'row', showLabels = true } = config;
  const textColor = config.style?.textColor;
  const accentColor = config.style?.accentColor;

  const setLinks = (newLinks) => onConfigChange({ ...config, links: newLinks });
  const addLink    = () => setLinks([...links, { ...EMPTY_LINK }]);
  const removeLink = (i) => setLinks(links.filter((_, idx) => idx !== i));
  const updateLink = (i, field, value) =>
    setLinks(links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  if (isEditing) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={{ padding: 12, height: '100%', overflowY: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Options row */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
              Layout
              <select
                value={layout}
                onChange={(e) => onConfigChange({ ...config, layout: e.target.value })}
                style={{ ...E.select, marginLeft: 2 }}
                {...fh}
              >
                <option value="row">Row</option>
                <option value="grid">Grid</option>
              </select>
            </label>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => onConfigChange({ ...config, showLabels: e.target.checked })}
                style={{ accentColor: '#111', width: 12, height: 12 }}
              />
              Show labels
            </label>
          </div>

          {/* Link rows */}
          {links.map((link, i) => {
            const plat = getPlatform(link.platform);
            return (
              <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 6, padding: '6px 8px' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: plat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700, color: link.platform === 'snapchat' ? '#000' : '#fff',
                  flexShrink: 0,
                }}>
                  {plat.icon}
                </div>
                <select
                  value={link.platform}
                  onChange={(e) => updateLink(i, 'platform', e.target.value)}
                  style={{ ...E.select, width: 90 }}
                  {...fh}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <input
                  value={link.url}
                  onChange={(e) => updateLink(i, 'url', e.target.value)}
                  placeholder="https://..."
                  style={{ ...E.input, flex: 1, minWidth: 0 }}
                  {...fh}
                />
                <input
                  value={link.label}
                  onChange={(e) => updateLink(i, 'label', e.target.value)}
                  placeholder="Label"
                  style={{ ...E.input, width: 72 }}
                  {...fh}
                />
                <button
                  onClick={() => removeLink(i)}
                  style={E.removeBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                >
                  ×
                </button>
              </div>
            );
          })}

          <button
            onClick={addLink}
            style={E.addBtn}
            onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#111'}
          >
            + Add link
          </button>
        </div>
      </BaseWidget>
    );
  }

  if (links.length === 0) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: 13, fontFamily: config.style?.fontFamily || 'inherit' }}>
          No social links added
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: layout === 'grid' ? 12 : 8,
        alignItems: 'center',
        justifyContent: layout === 'grid' ? 'center' : 'flex-start',
        height: '100%',
        boxSizing: 'border-box',
        fontFamily: config.style?.fontFamily || 'inherit',
      }}>
        {links.map((link, i) => {
          const plat = getPlatform(link.platform);
          const badgeColor = accentColor || plat.color;
          const displayLabel = link.label || plat.label;
          return (
            <a
              key={i}
              href={link.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: showLabels ? 8 : 0,
                textDecoration: 'none',
                padding: showLabels ? '7px 14px' : '8px',
                borderRadius: showLabels ? 8 : '50%',
                background: badgeColor + '18',
                border: `1px solid ${badgeColor}33`,
                transition: 'opacity 0.15s, transform 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{
                width: showLabels ? 22 : 28,
                height: showLabels ? 22 : 28,
                borderRadius: '50%',
                background: badgeColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: showLabels ? 8 : 10,
                fontWeight: 700,
                color: link.platform === 'snapchat' && !accentColor ? '#000' : '#fff',
                flexShrink: 0,
              }}>
                {plat.icon}
              </div>
              {showLabels && (
                <span style={{ fontSize: 13, fontWeight: 500, color: textColor || badgeColor }}>
                  {displayLabel}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </BaseWidget>
  );
};

export default SocialLinks;
