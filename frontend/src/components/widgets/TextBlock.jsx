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

// config: { title, body, align, style }
const TextBlock = ({ config = {}, isEditing, onConfigChange }) => {
  const { title = 'Title', body = 'Your text here...', align = 'left' } = config;
  const textColor = config.style?.textColor;

  if (isEditing) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={E.wrap}>
          <div style={E.fieldLabel}>Title</div>
          <input
            value={title}
            onChange={(e) => onConfigChange({ ...config, title: e.target.value })}
            placeholder="Title"
            style={{ ...E.input, fontWeight: 600, fontSize: 14 }}
            {...fh}
          />
          <div style={E.fieldLabel}>Body text</div>
          <textarea
            value={body}
            onChange={(e) => onConfigChange({ ...config, body: e.target.value })}
            placeholder="Your text..."
            rows={4}
            style={E.textarea}
            {...fh}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={E.fieldLabel}>Align</span>
            <select
              value={align}
              onChange={(e) => onConfigChange({ ...config, align: e.target.value })}
              style={E.select}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
      <div style={{ padding: '16px 20px', textAlign: align, height: '100%', boxSizing: 'border-box', fontFamily: config.style?.fontFamily || 'inherit' }}>
        {title && (
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: textColor }}>
            {title}
          </h2>
        )}
        <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, color: textColor }}>{body}</p>
      </div>
    </BaseWidget>
  );
};

export default TextBlock;
