const FONTS = [
  { value: 'system',     label: 'System (default)' },
  { value: 'inter',      label: 'Inter' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'playfair',   label: 'Playfair Display' },
  { value: 'serif',      label: 'Georgia (serif)' },
  { value: 'mono',       label: 'Courier (mono)' },
];

const GRADIENT_DIRS = [
  { value: 'to bottom',       label: 'Down' },
  { value: 'to right',        label: 'Right' },
  { value: 'to bottom right', label: 'Diagonal' },
  { value: 'to top right',    label: 'Diagonal up' },
];

const CARD_RADII = [
  { value: 'none', label: 'None', r: 2  },
  { value: 'sm',   label: 'S',    r: 4  },
  { value: 'md',   label: 'M',    r: 6  },
  { value: 'lg',   label: 'L',    r: 10 },
  { value: 'xl',   label: 'XL',   r: 16 },
];

const CARD_SHADOWS = [
  { value: 'none', label: 'None'   },
  { value: 'sm',   label: 'Soft'   },
  { value: 'md',   label: 'Medium' },
  { value: 'lg',   label: 'Strong' },
];

const THEMES = [
  {
    label: 'Minimal', preview: ['#ffffff', '#111111'],
    branding: {
      bgColor: '#ffffff', textColor: '#111111', accentColor: '#111111', accentTextColor: '#ffffff',
      pageBgType: 'solid', pageBgColor: '#f9fafb', fontFamily: 'system',
      cardRadius: 'md', cardShadow: 'sm', cardBg: '#ffffff',
    },
  },
  {
    label: 'Dark', preview: ['#111827', '#6366f1'],
    branding: {
      bgColor: '#111827', textColor: '#f9fafb', accentColor: '#6366f1', accentTextColor: '#ffffff',
      pageBgType: 'solid', pageBgColor: '#0f172a', fontFamily: 'inter',
      cardRadius: 'lg', cardShadow: 'lg', cardBg: '#1e293b',
    },
  },
  {
    label: 'Ocean', preview: ['#0c4a6e', '#38bdf8'],
    branding: {
      bgColor: '#0c4a6e', textColor: '#e0f2fe', accentColor: '#38bdf8', accentTextColor: '#0c4a6e',
      pageBgType: 'gradient', pageBgGradientFrom: '#0c4a6e', pageBgGradientTo: '#1e3a5f', pageBgGradientDir: 'to bottom',
      fontFamily: 'inter', cardRadius: 'lg', cardShadow: 'md', cardBg: 'rgba(255,255,255,0.08)',
    },
  },
  {
    label: 'Rose', preview: ['#fff1f2', '#e11d48'],
    branding: {
      bgColor: '#fff1f2', textColor: '#881337', accentColor: '#e11d48', accentTextColor: '#ffffff',
      pageBgType: 'gradient', pageBgGradientFrom: '#fff1f2', pageBgGradientTo: '#fce7f3', pageBgGradientDir: 'to bottom',
      fontFamily: 'playfair', cardRadius: 'xl', cardShadow: 'sm', cardBg: '#ffffff',
    },
  },
  {
    label: 'Forest', preview: ['#052e16', '#22c55e'],
    branding: {
      bgColor: '#14532d', textColor: '#f0fdf4', accentColor: '#22c55e', accentTextColor: '#052e16',
      pageBgType: 'solid', pageBgColor: '#052e16', fontFamily: 'system',
      cardRadius: 'md', cardShadow: 'md', cardBg: '#166534',
    },
  },
  {
    label: 'Warm', preview: ['#fef3c7', '#d97706'],
    branding: {
      bgColor: '#fef3c7', textColor: '#78350f', accentColor: '#d97706', accentTextColor: '#ffffff',
      pageBgType: 'gradient', pageBgGradientFrom: '#fef9c3', pageBgGradientTo: '#fed7aa', pageBgGradientDir: 'to bottom right',
      fontFamily: 'montserrat', cardRadius: 'lg', cardShadow: 'sm', cardBg: '#fffbeb',
    },
  },
  {
    label: 'Slate', preview: ['#1e293b', '#94a3b8'],
    branding: {
      bgColor: '#1e293b', textColor: '#f1f5f9', accentColor: '#94a3b8', accentTextColor: '#0f172a',
      pageBgType: 'gradient', pageBgGradientFrom: '#1e293b', pageBgGradientTo: '#0f172a', pageBgGradientDir: 'to bottom',
      fontFamily: 'system', cardRadius: 'sm', cardShadow: 'lg', cardBg: '#334155',
    },
  },
  {
    label: 'Sand', preview: ['#faf7f2', '#a16207'],
    branding: {
      bgColor: '#faf7f2', textColor: '#44403c', accentColor: '#a16207', accentTextColor: '#ffffff',
      pageBgType: 'solid', pageBgColor: '#f5f0e8', fontFamily: 'playfair',
      cardRadius: 'md', cardShadow: 'sm', cardBg: '#faf7f2',
    },
  },
];

// ── Style tokens ──────────────────────────────────────────────────────────────
const S = {
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9ca3af',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: { fontSize: 13, color: '#374151' },
  input: {
    padding: '6px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 13,
    width: 200,
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fff',
    color: '#111',
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 2 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

function ColorRow({ label, value, onChange }) {
  return (
    <div style={S.row}>
      <span style={S.label}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 36, height: 28, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer', padding: 2 }}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...S.input, width: 92 }}
          {...fh}
        />
      </div>
    </div>
  );
}

export default function BrandingEditor({ branding, onChange }) {
  const set = (key, value) => onChange({ ...branding, [key]: value });
  const applyTheme = (theme) => onChange({ ...branding, ...theme.branding });

  const pageBgType = branding.pageBgType || 'solid';

  return (
    <div style={{ paddingTop: 4 }}>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 20px', lineHeight: 1.5 }}>
        Changes are applied when you click Save layout in the editor.
      </p>

      {/* Themes */}
      <div style={{ marginBottom: 28 }}>
        <div style={S.sectionTitle}>Themes</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {THEMES.map((t) => (
            <button
              key={t.label}
              onClick={() => applyTheme(t)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7,
                background: '#fff', cursor: 'pointer', fontSize: 13, textAlign: 'left',
                transition: 'border-color 0.1s, background 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
            >
              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                {t.preview.map((c, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                ))}
              </div>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div style={{ marginBottom: 24 }}>
        <div style={S.sectionTitle}>Logo</div>
        <div style={S.row}>
          <span style={S.label}>Text</span>
          <input
            value={branding.logoText || ''}
            onChange={(e) => set('logoText', e.target.value)}
            placeholder="Your name or brand"
            style={S.input}
            {...fh}
          />
        </div>
        <div style={S.row}>
          <span style={S.label}>Image URL</span>
          <input
            value={branding.logoUrl || ''}
            onChange={(e) => set('logoUrl', e.target.value)}
            placeholder="https://..."
            style={S.input}
            {...fh}
          />
        </div>
      </div>

      {/* Navbar */}
      <div style={{ marginBottom: 24 }}>
        <div style={S.sectionTitle}>Navbar</div>
        <ColorRow label="Background" value={branding.bgColor || '#ffffff'} onChange={(v) => set('bgColor', v)} />
        <ColorRow label="Text"       value={branding.textColor || '#111111'} onChange={(v) => set('textColor', v)} />
        <div style={S.row}>
          <span style={S.label}>Font</span>
          <select
            value={branding.fontFamily || 'system'}
            onChange={(e) => set('fontFamily', e.target.value)}
            style={{ ...S.input, cursor: 'pointer' }}
            {...fh}
          >
            {FONTS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Book now button */}
      <div style={{ marginBottom: 24 }}>
        <div style={S.sectionTitle}>Book now button</div>
        <ColorRow label="Background" value={branding.accentColor || '#111111'} onChange={(v) => set('accentColor', v)} />
        <ColorRow label="Text"       value={branding.accentTextColor || '#ffffff'} onChange={(v) => set('accentTextColor', v)} />
      </div>

      {/* Page Background */}
      <div style={{ marginBottom: 24 }}>
        <div style={S.sectionTitle}>Page Background</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[['solid', 'Solid'], ['gradient', 'Gradient'], ['image', 'Image']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => set('pageBgType', v)}
              style={{
                flex: 1,
                padding: '6px 0',
                border: `1.5px solid ${pageBgType === v ? '#111' : '#e5e7eb'}`,
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                background: pageBgType === v ? '#111' : '#fff',
                color: pageBgType === v ? '#fff' : '#374151',
                fontWeight: pageBgType === v ? 600 : 400,
                transition: 'all 0.1s',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {pageBgType === 'solid' && (
          <ColorRow label="Color" value={branding.pageBgColor || '#f9fafb'} onChange={(v) => set('pageBgColor', v)} />
        )}

        {pageBgType === 'gradient' && (
          <div>
            <ColorRow label="From" value={branding.pageBgGradientFrom || '#ffffff'} onChange={(v) => set('pageBgGradientFrom', v)} />
            <ColorRow label="To"   value={branding.pageBgGradientTo || '#f3f4f6'} onChange={(v) => set('pageBgGradientTo', v)} />
            <div style={S.row}>
              <span style={S.label}>Direction</span>
              <select
                value={branding.pageBgGradientDir || 'to bottom'}
                onChange={(e) => set('pageBgGradientDir', e.target.value)}
                style={{ ...S.input, cursor: 'pointer' }}
                {...fh}
              >
                {GRADIENT_DIRS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div style={{
              height: 40, borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 4,
              background: `linear-gradient(${branding.pageBgGradientDir || 'to bottom'}, ${branding.pageBgGradientFrom || '#fff'}, ${branding.pageBgGradientTo || '#f3f4f6'})`,
            }} />
          </div>
        )}

        {pageBgType === 'image' && (
          <div style={S.row}>
            <span style={S.label}>Image URL</span>
            <input
              value={branding.pageBgImage || ''}
              onChange={(e) => set('pageBgImage', e.target.value)}
              placeholder="https://..."
              style={S.input}
              {...fh}
            />
          </div>
        )}
      </div>

      {/* Cards */}
      <div style={{ marginBottom: 24 }}>
        <div style={S.sectionTitle}>Cards</div>
        <ColorRow label="Background" value={branding.cardBg || '#ffffff'} onChange={(v) => set('cardBg', v)} />

        <div style={{ ...S.row, alignItems: 'flex-start' }}>
          <span style={{ ...S.label, paddingTop: 2 }}>Corners</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {CARD_RADII.map(({ value, label, r }) => {
              const active = branding.cardRadius === value;
              return (
                <button
                  key={value}
                  onClick={() => set('cardRadius', value)}
                  style={{
                    width: 36, height: 28,
                    border: `1.5px solid ${active ? '#111' : '#e5e7eb'}`,
                    borderRadius: r,
                    fontSize: 11, cursor: 'pointer',
                    background: active ? '#111' : '#fff',
                    color: active ? '#fff' : '#374151',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = '#d1d5db'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ ...S.row, alignItems: 'flex-start' }}>
          <span style={{ ...S.label, paddingTop: 2 }}>Shadow</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {CARD_SHADOWS.map(({ value, label }) => {
              const active = branding.cardShadow === value;
              return (
                <button
                  key={value}
                  onClick={() => set('cardShadow', value)}
                  style={{
                    padding: '4px 10px',
                    border: `1.5px solid ${active ? '#111' : '#e5e7eb'}`,
                    borderRadius: 6,
                    fontSize: 11, cursor: 'pointer',
                    background: active ? '#111' : '#fff',
                    color: active ? '#fff' : '#374151',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = '#d1d5db'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
