import { useNavigate, useParams } from 'react-router-dom';
import BaseWidget from './BaseWidget';

// ── Edit-mode style tokens ────────────────────────────────────────────────────
const E = {
  wrap: { padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
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
  colorRow: { display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' },
  colorLabel: { display: 'flex', flexDirection: 'column', gap: 4 },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 1 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

// config: { label, backgroundColor, textColor, style }
const CallToAction = ({ config = {}, isEditing, onConfigChange }) => {
  const { label = 'Book an appointment', backgroundColor = '#111111', textColor = '#ffffff' } = config;
  // config.style overrides: accentColor overrides button background, textColor overrides button text
  const btnBg = config.style?.accentColor || backgroundColor;
  const btnText = config.style?.textColor || textColor;
  const { username } = useParams();
  const navigate = useNavigate();

  if (isEditing) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={E.wrap}>
          <div>
            <div style={E.fieldLabel}>Button label</div>
            <input
              value={label}
              onChange={(e) => onConfigChange({ ...config, label: e.target.value })}
              placeholder="Book an appointment"
              style={E.input}
              {...fh}
            />
          </div>
          <div style={E.colorRow}>
            <div style={E.colorLabel}>
              <span style={E.fieldLabel}>Background</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => onConfigChange({ ...config, backgroundColor: e.target.value })}
                  style={{ width: 32, height: 28, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer', padding: 2 }}
                />
                <span style={{ fontSize: 12, color: '#6b7280' }}>{backgroundColor}</span>
              </div>
            </div>
            <div style={E.colorLabel}>
              <span style={E.fieldLabel}>Text</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => onConfigChange({ ...config, textColor: e.target.value })}
                  style={{ width: 32, height: 28, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer', padding: 2 }}
                />
                <span style={{ fontSize: 12, color: '#6b7280' }}>{textColor}</span>
              </div>
            </div>
          </div>
          {/* Preview */}
          <div style={{ marginTop: 4, textAlign: 'center' }}>
            <button
              disabled
              style={{
                padding: '8px 20px',
                background: backgroundColor,
                color: textColor,
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'default',
                opacity: 0.9,
              }}
            >
              {label}
            </button>
          </div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 16, fontFamily: config.style?.fontFamily || 'inherit' }}>
        <button
          onClick={() => username && navigate(`/${username}/book`)}
          style={{
            padding: '14px 36px',
            background: btnBg,
            color: btnText,
            fontSize: 17,
            fontWeight: 700,
            border: 'none',
            borderRadius: 8,
            cursor: username ? 'pointer' : 'default',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'opacity 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          {label}
        </button>
      </div>
    </BaseWidget>
  );
};

export default CallToAction;
