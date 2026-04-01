import BaseWidget from './BaseWidget';

// ── Edit-mode style tokens ────────────────────────────────────────────────────
const E = {
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
  select: {
    padding: '5px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    fontSize: 12,
    background: '#fff',
    color: '#374151',
    outline: 'none',
    cursor: 'pointer',
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 1 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

// config: { imageUrl, overlayText, overlayPosition ('top'|'center'|'bottom'), style }
const ImageBanner = ({ config = {}, isEditing, onConfigChange }) => {
  const { imageUrl = '', overlayText = '', overlayPosition = 'center' } = config;
  const positionMap = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
  const textColor = config.style?.textColor;
  const accentColor = config.style?.accentColor;

  const banner = (
    <div
      style={{
        width: '100%',
        height: isEditing ? 130 : '100%',
        fontFamily: config.style?.fontFamily || 'inherit',
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: positionMap[overlayPosition],
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {!imageUrl && isEditing && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: '#9ca3af', background: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: 5 }}>
            No image — add a URL below
          </span>
        </div>
      )}
      {!imageUrl && !isEditing && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>Image banner</span>
        </div>
      )}
      {overlayText && (
        <span
          style={{
            background: accentColor ? accentColor + 'cc' : 'rgba(0,0,0,0.48)',
            color: textColor || '#fff',
            padding: '8px 20px',
            fontSize: 22,
            fontWeight: 700,
            borderRadius: 3,
            margin: 16,
          }}
        >
          {overlayText}
        </span>
      )}
    </div>
  );

  if (isEditing) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {banner}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1 }}>
            <div>
              <div style={E.fieldLabel}>Image URL</div>
              <input
                value={imageUrl}
                onChange={(e) => onConfigChange({ ...config, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                style={E.input}
                {...fh}
              />
            </div>
            <div>
              <div style={E.fieldLabel}>Overlay text</div>
              <input
                value={overlayText}
                onChange={(e) => onConfigChange({ ...config, overlayText: e.target.value })}
                placeholder="Optional text on image"
                style={E.input}
                {...fh}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={E.fieldLabel}>Position</span>
              <select
                value={overlayPosition}
                onChange={(e) => onConfigChange({ ...config, overlayPosition: e.target.value })}
                style={E.select}
              >
                <option value="top">Text: Top</option>
                <option value="center">Text: Center</option>
                <option value="bottom">Text: Bottom</option>
              </select>
            </div>
          </div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
      {banner}
    </BaseWidget>
  );
};

export default ImageBanner;
