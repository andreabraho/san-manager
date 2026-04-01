import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import BaseWidget from './BaseWidget';

// ── Edit-mode style tokens ────────────────────────────────────────────────────
const E = {
  wrap: { padding: 12, display: 'flex', flexDirection: 'column', gap: 6, height: '100%', overflowY: 'auto', boxSizing: 'border-box' },
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
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    fontSize: 13,
    background: '#fff',
    color: '#374151',
    outline: 'none',
    cursor: 'pointer',
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
    resize: 'none',
    outline: 'none',
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 1 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

// config: { serviceId, serviceName, price, description, duration, buttonLabel, style }
const ServiceCard = ({ config = {}, isEditing, onConfigChange, providerUsername }) => {
  const {
    serviceId = '',
    serviceName = 'Service Name',
    price = '',
    description = '',
    duration = '',
    buttonLabel = 'Book now',
  } = config;
  const textColor = config.style?.textColor;
  const accentColor = config.style?.accentColor;

  const { username: urlUsername } = useParams();
  const navigate = useNavigate();
  const username = providerUsername || urlUsername;

  const [services, setServices] = useState([]);

  useEffect(() => {
    if (!isEditing) return;
    api.get('/provider/services').then((res) => setServices(res.data)).catch(() => {});
  }, [isEditing]);

  const handleSelectService = (id) => {
    const svc = services.find((s) => s._id === id);
    if (!svc) {
      onConfigChange({ ...config, serviceId: '' });
      return;
    }
    onConfigChange({
      ...config,
      serviceId: svc._id,
      serviceName: svc.name,
      description: svc.description || '',
      duration: svc.durationMinutes ? `${svc.durationMinutes} min` : '',
    });
  };

  if (isEditing) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={E.wrap}>
          <div style={E.fieldLabel}>Linked service</div>
          <select
            value={serviceId}
            onChange={(e) => handleSelectService(e.target.value)}
            style={E.select}
            {...fh}
          >
            <option value="">— manual entry —</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 6, marginTop: 2 }}>
            <div style={E.fieldLabel}>Display</div>
          </div>
          <input
            value={serviceName}
            onChange={(e) => onConfigChange({ ...config, serviceName: e.target.value })}
            placeholder="Service name"
            style={E.input}
            {...fh}
          />
          <input
            value={price}
            onChange={(e) => onConfigChange({ ...config, price: e.target.value })}
            placeholder="Price (e.g. €50)"
            style={E.input}
            {...fh}
          />
          <input
            value={duration}
            onChange={(e) => onConfigChange({ ...config, duration: e.target.value })}
            placeholder="Duration (e.g. 60 min)"
            style={E.input}
            {...fh}
          />
          <textarea
            value={description}
            onChange={(e) => onConfigChange({ ...config, description: e.target.value })}
            placeholder="Description..."
            rows={2}
            style={E.textarea}
            {...fh}
          />
          <input
            value={buttonLabel}
            onChange={(e) => onConfigChange({ ...config, buttonLabel: e.target.value })}
            placeholder="Button label"
            style={E.input}
            {...fh}
          />
        </div>
      </BaseWidget>
    );
  }

  const bookingUrl = username
    ? `/${username}/book${serviceId ? `?serviceId=${serviceId}` : ''}`
    : null;

  return (
    <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
      <div style={{ padding: '18px 18px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', fontFamily: config.style?.fontFamily || 'inherit' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, lineHeight: 1.3, color: textColor }}>{serviceName}</h3>
        <div style={{ display: 'flex', gap: 12, color: textColor || '#6b7280', fontSize: 13, marginBottom: 10, flexWrap: 'wrap' }}>
          {price && (
            <span style={{ fontWeight: 600, color: textColor || '#111', fontSize: 15 }}>{price}</span>
          )}
          {duration && (
            <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 5, fontSize: 12, color: textColor || undefined }}>{duration}</span>
          )}
        </div>
        {description && (
          <p style={{ margin: '0 0 14px', fontSize: 13, color: textColor || '#374151', flex: 1, lineHeight: 1.6 }}>{description}</p>
        )}
        {bookingUrl && (
          <button
            onClick={() => navigate(bookingUrl)}
            style={{
              marginTop: 'auto',
              padding: '8px 18px',
              background: accentColor || '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              alignSelf: 'flex-start',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = accentColor ? accentColor + 'cc' : '#222'}
            onMouseLeave={(e) => e.currentTarget.style.background = accentColor || '#111'}
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </BaseWidget>
  );
};

export default ServiceCard;
