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
    borderRadius: 5,
    fontSize: 11,
    cursor: 'pointer',
    flexShrink: 0,
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 1 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

// config: { images: [{ url, caption }], columns, style }
const Gallery = ({ config = {}, isEditing, onConfigChange }) => {
  const { images = [], columns = 3 } = config;
  const textColor = config.style?.textColor;

  const addImage = () =>
    onConfigChange({ ...config, images: [...images, { url: '', caption: '' }] });

  const updateImage = (index, field, value) => {
    const updated = images.map((img, i) => (i === index ? { ...img, [field]: value } : img));
    onConfigChange({ ...config, images: updated });
  };

  const removeImage = (index) =>
    onConfigChange({ ...config, images: images.filter((_, i) => i !== index) });

  if (isEditing) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={{ padding: 12, overflowY: 'auto', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Columns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={E.fieldLabel}>Columns</span>
            <input
              type="number"
              min={1}
              max={6}
              value={columns}
              onChange={(e) => onConfigChange({ ...config, columns: Number(e.target.value) })}
              style={{ ...E.input, width: 56 }}
              {...fh}
            />
          </div>

          {/* Image entries */}
          {images.map((img, i) => (
            <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 6, padding: 8, background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ ...E.fieldLabel, margin: 0 }}>Image {i + 1}</span>
                <button
                  onClick={() => removeImage(i)}
                  style={E.removeBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                >
                  Remove
                </button>
              </div>
              <input
                value={img.url}
                onChange={(e) => updateImage(i, 'url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={E.input}
                {...fh}
              />
              <input
                value={img.caption}
                onChange={(e) => updateImage(i, 'caption', e.target.value)}
                placeholder="Caption (optional)"
                style={E.input}
                {...fh}
              />
            </div>
          ))}

          <button
            onClick={addImage}
            style={E.addBtn}
            onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#111'}
          >
            + Add image
          </button>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 8,
          padding: 10,
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
          fontFamily: config.style?.fontFamily || 'inherit',
        }}
      >
        {images.length === 0 ? (
          <div style={{ gridColumn: `1 / -1`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13, minHeight: 80 }}>
            No images
          </div>
        ) : (
          images.map((img, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <img
                src={img.url || 'https://placehold.co/200x150'}
                alt={img.caption}
                style={{ width: '100%', objectFit: 'cover', borderRadius: 6, aspectRatio: '4/3', display: 'block' }}
              />
              {img.caption && (
                <p style={{ fontSize: 12, marginTop: 5, color: textColor || '#6b7280', margin: '5px 0 0' }}>{img.caption}</p>
              )}
            </div>
          ))
        )}
      </div>
    </BaseWidget>
  );
};

export default Gallery;
