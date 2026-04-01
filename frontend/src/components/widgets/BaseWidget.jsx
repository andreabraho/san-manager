import { useEffect, useState } from 'react';
import { useBranding, CARD_RADIUS, CARD_SHADOW } from '../../context/BrandingContext';

// ── Font options ──────────────────────────────────────────────────────────────
const FONTS = [
  { value: '',                                label: 'Default' },
  { value: 'Inter, sans-serif',               label: 'Inter' },
  { value: 'Georgia, serif',                  label: 'Georgia' },
  { value: '"Playfair Display", serif',        label: 'Playfair' },
  { value: 'Montserrat, sans-serif',           label: 'Montserrat' },
  { value: '"Courier New", monospace',         label: 'Mono' },
  { value: '"Comic Sans MS", cursive',         label: 'Comic Sans' },
];

// Google Fonts that need a <link> injected — keyed by the font-family value string
const GOOGLE_FONT_URLS = {
  'Inter, sans-serif':          'Inter',
  '"Playfair Display", serif':  'Playfair+Display',
  'Montserrat, sans-serif':     'Montserrat',
};

// ── Shared style panel component ──────────────────────────────────────────────
const ColorRow = ({ label, value, onChange }) => {
  const safeValue = value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#ffffff';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', width: 76, flexShrink: 0 }}>
        {label}
      </span>
      <input
        type="color"
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 28, height: 26, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer', padding: 2, flexShrink: 0 }}
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        maxLength={7}
        style={{
          width: 72,
          padding: '3px 6px',
          border: '1px solid #e5e7eb',
          borderRadius: 4,
          fontSize: 12,
          fontFamily: 'monospace',
          color: '#374151',
          background: '#fff',
          outline: 'none',
        }}
      />
    </div>
  );
};

// ── BaseWidget ────────────────────────────────────────────────────────────────
const BaseWidget = ({ config = {}, isEditing, onConfigChange, children }) => {
  const branding = useBranding();
  const radius = CARD_RADIUS[branding.cardRadius] ?? 8;
  const shadow = isEditing ? 'none' : (CARD_SHADOW[branding.cardShadow] ?? 'none');
  const brandBg = branding.cardBg || '#ffffff';

  const [styleOpen, setStyleOpen] = useState(false);

  const widgetStyle = config.style || {};
  const bg = widgetStyle.bgColor || brandBg;
  const textColor = widgetStyle.textColor || undefined;

  // Inject Google Fonts <link> when a Google-hosted font is selected
  useEffect(() => {
    const fontValue = widgetStyle.fontFamily;
    if (fontValue && GOOGLE_FONT_URLS[fontValue]) {
      const id = `gfont-widget-${GOOGLE_FONT_URLS[fontValue].replace(/\+/g, '-')}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONT_URLS[fontValue]}:wght@400;500;700&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [widgetStyle.fontFamily]);

  const setStyleProp = (key, value) => {
    onConfigChange({ ...config, style: { ...widgetStyle, [key]: value } });
  };

  const resetStyle = () => {
    onConfigChange({ ...config, style: {} });
  };

  if (isEditing) {
    return (
      <div style={{
        width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
        borderRadius: radius,
        boxShadow: 'none',
        background: bg,
        color: textColor,
        fontFamily: widgetStyle.fontFamily || undefined,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Widget content area — fills remaining space */}
        <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {children}
        </div>

        {/* Style panel */}
        <div style={{ borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
          <button
            onClick={() => setStyleOpen((v) => !v)}
            style={{
              width: '100%',
              padding: '5px 12px',
              background: 'none',
              border: 'none',
              borderRadius: 0,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              color: '#6b7280',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              letterSpacing: '0.03em',
            }}
          >
            <span style={{ fontSize: 13 }}>&#127912;</span>
            Style {styleOpen ? '▴' : '▾'}
          </button>

          {styleOpen && (
            <div style={{ padding: '8px 12px 10px', background: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
              <ColorRow
                label="Background"
                value={widgetStyle.bgColor || ''}
                onChange={(v) => setStyleProp('bgColor', v)}
              />
              <ColorRow
                label="Text color"
                value={widgetStyle.textColor || ''}
                onChange={(v) => setStyleProp('textColor', v)}
              />
              <ColorRow
                label="Accent"
                value={widgetStyle.accentColor || ''}
                onChange={(v) => setStyleProp('accentColor', v)}
              />
              {/* Font family row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', width: 76, flexShrink: 0 }}>
                  Font
                </span>
                <select
                  value={widgetStyle.fontFamily || ''}
                  onChange={(e) => setStyleProp('fontFamily', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '3px 6px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 4,
                    fontSize: 12,
                    background: '#fff',
                    color: '#374151',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={resetStyle}
                style={{
                  marginTop: 2,
                  padding: '4px 10px',
                  fontSize: 11,
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                  background: '#fff',
                  color: '#6b7280',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
              >
                Reset to defaults
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
      borderRadius: radius,
      boxShadow: shadow,
      background: bg,
      color: textColor,
      fontFamily: widgetStyle.fontFamily || undefined,
    }}>
      {children}
    </div>
  );
};

export default BaseWidget;
