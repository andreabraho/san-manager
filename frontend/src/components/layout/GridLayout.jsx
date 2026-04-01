import { useState, useEffect } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import WidgetRegistry from '../widgets/WidgetRegistry';
import { BrandingContext } from '../../context/BrandingContext';

const ReactGridLayout = WidthProvider(RGL);

// ── Palette button ────────────────────────────────────────────────────────────
function PaletteBtn({ onClick, children, compact }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: compact ? '6px 10px' : '5px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        fontSize: 12,
        background: '#fff',
        color: '#374151',
        cursor: 'pointer',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'border-color 0.1s, background 0.1s',
        whiteSpace: 'nowrap',
        minHeight: 44,
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
    >
      <span style={{ fontSize: 14, lineHeight: 1, color: '#6b7280' }}>+</span>
      {children}
    </button>
  );
}

// ── Remove button ─────────────────────────────────────────────────────────────
function RemoveBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Remove widget"
      style={{
        position: 'absolute',
        top: 6,
        right: 6,
        zIndex: 10,
        background: '#ef4444',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 22,
        height: 22,
        cursor: 'pointer',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
      onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
    >
      ×
    </button>
  );
}

// ── Save button ───────────────────────────────────────────────────────────────
function SaveBtn({ onClick, fixed }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...(fixed ? {
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 300,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          minHeight: 48,
        } : {
          marginLeft: 'auto',
        }),
        padding: '7px 18px',
        background: '#111',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
      onMouseLeave={(e) => e.currentTarget.style.background = '#111'}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
      Save layout
    </button>
  );
}

// ── Empty editing state ───────────────────────────────────────────────────────
function EmptyEditor() {
  return (
    <div style={{
      border: '2px dashed #e5e7eb',
      borderRadius: 10,
      padding: '48px 24px',
      textAlign: 'center',
      marginTop: 8,
    }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Your page is empty
      </div>
      <div style={{ fontSize: 13, color: '#9ca3af' }}>
        Add widgets from the palette above to start building your page.
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const GridLayout = ({ widgets = [], isEditing = false, cols = 12, onSave, enabledTypes, providerUsername, branding = {} }) => {
  const [items, setItems] = useState(widgets);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const layout = items.map((w) => ({
    i: w.widgetId,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
  }));

  const onLayoutChange = (newLayout) => {
    const updated = items.map((w) => {
      const pos = newLayout.find((l) => l.i === w.widgetId);
      return pos ? { ...w, x: pos.x, y: pos.y, w: pos.w, h: pos.h } : w;
    });
    setItems(updated);
  };

  const onConfigChange = (widgetId, newConfig) => {
    setItems((prev) =>
      prev.map((w) => (w.widgetId === widgetId ? { ...w, config: newConfig } : w))
    );
  };

  const addWidget = (type) => {
    const reg = WidgetRegistry[type];
    if (!reg) return;
    const newWidget = {
      widgetId: crypto.randomUUID(),
      type,
      x: 0,
      y: Infinity,
      w: reg.defaultSize.w,
      h: reg.defaultSize.h,
      config: { ...reg.defaultConfig },
    };
    setItems((prev) => [...prev, newWidget]);
  };

  const removeWidget = (widgetId) => {
    setItems((prev) => prev.filter((w) => w.widgetId !== widgetId));
  };

  const availableTypes = Object.entries(WidgetRegistry).filter(
    ([key]) => !enabledTypes || enabledTypes.has(key)
  );

  return (
    <BrandingContext.Provider value={branding}>
      <div>
        {/* Editing toolbar */}
        {isEditing && (
          <div style={{
            marginBottom: 16,
            display: 'flex',
            gap: 6,
            flexWrap: isMobile ? 'nowrap' : 'wrap',
            alignItems: 'center',
            padding: '10px 12px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            overflowX: isMobile ? 'auto' : 'visible',
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#9ca3af',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginRight: 4,
              flexShrink: 0,
            }}>
              Add widget
            </span>
            {availableTypes.map(([key, reg]) => (
              <PaletteBtn key={key} onClick={() => addWidget(key)} compact={isMobile}>
                {reg.label}
              </PaletteBtn>
            ))}
            {/* Desktop save button — inline in toolbar */}
            {!isMobile && (
              <SaveBtn onClick={() => onSave && onSave(items)} fixed={false} />
            )}
          </div>
        )}

        {/* Empty state in editing mode */}
        {isEditing && items.length === 0 && <EmptyEditor />}

        <ReactGridLayout
          layout={layout}
          cols={cols}
          rowHeight={50}
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={onLayoutChange}
          draggableCancel="input,textarea,select,button"
        >
          {items.map((w) => {
            const reg = WidgetRegistry[w.type];
            if (!reg) return null;
            const WidgetComponent = reg.component;
            return (
              <div
                key={w.widgetId}
                style={{
                  border: isEditing ? '1.5px dashed #d1d5db' : 'none',
                  borderRadius: 8,
                  position: 'relative',
                }}
              >
                {isEditing && <RemoveBtn onClick={() => removeWidget(w.widgetId)} />}
                <WidgetComponent
                  config={w.config}
                  isEditing={isEditing}
                  onConfigChange={(newConfig) => onConfigChange(w.widgetId, newConfig)}
                  providerUsername={providerUsername}
                />
              </div>
            );
          })}
        </ReactGridLayout>

        {/* Mobile fixed save button */}
        {isEditing && isMobile && (
          <SaveBtn onClick={() => onSave && onSave(items)} fixed={true} />
        )}
      </div>
    </BrandingContext.Provider>
  );
};

export default GridLayout;
