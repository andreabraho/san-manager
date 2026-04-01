import BaseWidget from './BaseWidget';

// ── Edit-mode style tokens ────────────────────────────────────────────────────
const E = {
  wrap: { padding: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  fieldLabel: { fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' },
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

// config: { lineStyle ('solid'|'dashed'|'dotted'), color, spacing, style: { bgColor, textColor, accentColor } }
// Backward compat: config.style may be a string in older saved widgets — treated as lineStyle in that case.
const Divider = ({ config = {}, isEditing, onConfigChange }) => {
  // Support old format where config.style was the line style string
  const legacyLineStyle = typeof config.style === 'string' ? config.style : undefined;
  const lineStyle = config.lineStyle ?? legacyLineStyle ?? 'solid';
  const { color = '#e5e7eb', spacing = 16 } = config;

  // config.style.bgColor is applied by BaseWidget; accentColor overrides the line color
  const widgetStyle = typeof config.style === 'object' && config.style !== null ? config.style : {};
  const accentColor = widgetStyle.accentColor;

  if (isEditing) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={E.wrap}>
          <div>
            <div style={E.fieldLabel}>Style</div>
            <select
              value={lineStyle}
              onChange={(e) => onConfigChange({ ...config, lineStyle: e.target.value })}
              style={E.select}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e)  => Object.assign(e.target.style, blurStyle)}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
          <div>
            <div style={E.fieldLabel}>Color</div>
            <input
              type="color"
              value={color}
              onChange={(e) => onConfigChange({ ...config, color: e.target.value })}
              style={{ width: 36, height: 28, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer', padding: 2 }}
            />
          </div>
          {/* Live preview */}
          <div style={{ flex: 1, minWidth: 60 }}>
            <hr style={{ width: '100%', borderStyle: lineStyle, borderColor: color, borderWidth: 1, margin: '10px 0 0' }} />
          </div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: `0 ${spacing}px`, fontFamily: widgetStyle.fontFamily || 'inherit' }}>
        <hr style={{ width: '100%', borderStyle: lineStyle, borderColor: accentColor || color, borderWidth: 1, margin: 0 }} />
      </div>
    </BaseWidget>
  );
};

export default Divider;
