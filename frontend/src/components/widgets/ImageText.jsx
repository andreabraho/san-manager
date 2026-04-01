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
    minHeight: 60,
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

// config: { imageUrl, text, imagePosition ('left'|'right'), style }
const ImageText = ({ config = {}, isEditing, onConfigChange }) => {
  const { imageUrl = '', text = 'Your text here...', imagePosition = 'left' } = config;
  const textColor = config.style?.textColor;

  if (isEditing) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={E.wrap}>
          <div style={E.fieldLabel}>Image URL</div>
          <input
            value={imageUrl}
            onChange={(e) => onConfigChange({ ...config, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
            style={E.input}
            {...fh}
          />
          <div style={E.fieldLabel}>Text</div>
          <textarea
            value={text}
            onChange={(e) => onConfigChange({ ...config, text: e.target.value })}
            placeholder="Your text..."
            rows={4}
            style={E.textarea}
            {...fh}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={E.fieldLabel}>Image position</span>
            <select
              value={imagePosition}
              onChange={(e) => onConfigChange({ ...config, imagePosition: e.target.value })}
              style={E.select}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </BaseWidget>
    );
  }

  const img = (
    <img
      src={imageUrl || 'https://placehold.co/300x200'}
      alt=""
      style={{ width: '44%', objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
    />
  );
  const txt = (
    <p style={{ flex: 1, padding: '0 14px', whiteSpace: 'pre-wrap', margin: 0, fontSize: 14, lineHeight: 1.7, color: textColor }}>
      {text}
    </p>
  );

  return (
    <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: 12, gap: 0, fontFamily: config.style?.fontFamily || 'inherit' }}>
        {imagePosition === 'left' ? <>{img}{txt}</> : <>{txt}{img}</>}
      </div>
    </BaseWidget>
  );
};

export default ImageText;
