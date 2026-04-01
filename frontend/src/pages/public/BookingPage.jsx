import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProviderNavbar from '../../components/layout/ProviderNavbar';
import { getPageBackground } from '../../context/BrandingContext';

const INITIAL_GUEST = { firstName: '', lastName: '', email: '', phone: '', isFirstTime: false };
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// ── Style tokens ──────────────────────────────────────────────────────────────
const inputStyle = {
  display: 'block',
  width: '100%',
  marginBottom: 12,
  padding: '9px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  fontSize: 14,
  boxSizing: 'border-box',
  background: '#fff',
  color: '#111',
  outline: 'none',
};
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 };
const selectStyle = { ...inputStyle };
const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 2 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

const stepLabel = (n, label, active) => ({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 14,
  color: active ? '#374151' : '#d1d5db',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const stepNum = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: '50%',
  fontSize: 10,
  fontWeight: 700,
  background: active ? '#111' : '#e5e7eb',
  color: active ? '#fff' : '#9ca3af',
  flexShrink: 0,
});

// ── Month grid builder ────────────────────────────────────────────────────────
function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

// ── Date picker ───────────────────────────────────────────────────────────────
function DatePicker({ availableDates, selectedDate, onSelect, accentColor }) {
  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const cells = buildMonthGrid(view.getFullYear(), view.getMonth());
  const availableSet = new Set(availableDates);

  const toStr = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isToday = (day) =>
    day === today.getDate() && view.getMonth() === today.getMonth() && view.getFullYear() === today.getFullYear();

  const prevMonth = () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  const nextMonth = () => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));

  const accent = accentColor || '#111';

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, background: '#fff' }}>
      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button
          type="button"
          onClick={prevMonth}
          style={{ padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 16, lineHeight: 1, color: '#374151' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
        >‹</button>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>
          {MONTH_NAMES[view.getMonth()]} {view.getFullYear()}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          style={{ padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 16, lineHeight: 1, color: '#374151' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
        >›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 600, padding: '2px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = toStr(view.getFullYear(), view.getMonth(), day);
          const isAvailable = availableSet.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isPast = dateStr < today.toISOString().slice(0, 10);
          const todayFlag = isToday(day);

          return (
            <button
              type="button"
              key={day}
              disabled={!isAvailable || isPast}
              onClick={() => onSelect(dateStr)}
              style={{
                aspectRatio: '1',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: todayFlag ? 700 : 400,
                cursor: isAvailable && !isPast ? 'pointer' : 'default',
                background: isSelected
                  ? accent
                  : isAvailable && !isPast
                    ? '#f0fdf4'
                    : 'transparent',
                color: isSelected
                  ? '#fff'
                  : isAvailable && !isPast
                    ? '#166534'
                    : '#d1d5db',
                outline: todayFlag && !isSelected ? `2px solid ${accent}` : 'none',
                outlineOffset: -2,
                transition: 'background 0.1s',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#f0fdf4', border: '1px solid #16a34a' }} />
          Available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: accent }} />
          Selected
        </div>
      </div>
    </div>
  );
}

// ── Slot picker ───────────────────────────────────────────────────────────────
function SlotPicker({ slots, selectedSlot, onSelect, accentColor, loading }) {
  const accent = accentColor || '#111';

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff' }}>
        <div style={{ width: 20, height: 20, border: '2px solid #e5e7eb', borderTopColor: accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 8px' }} />
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Loading available times...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div style={{ padding: '16px', color: '#6b7280', fontSize: 13, border: '1px dashed #e5e7eb', borderRadius: 10, textAlign: 'center' }}>
        No available time slots for this date.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {slots.map((slot) => {
        const selected = selectedSlot === slot;
        return (
          <button
            type="button"
            key={slot}
            onClick={() => onSelect(slot)}
            style={{
              padding: '8px 16px',
              border: `1.5px solid ${selected ? accent : '#e5e7eb'}`,
              borderRadius: 6,
              fontSize: 14,
              fontWeight: selected ? 600 : 400,
              background: selected ? accent : '#fff',
              color: selected ? '#fff' : '#374151',
              cursor: 'pointer',
              minWidth: 72,
              textAlign: 'center',
              transition: 'border-color 0.1s, background 0.1s',
            }}
            onMouseEnter={(e) => {
              if (!selected) {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.color = accent;
              }
            }}
            onMouseLeave={(e) => {
              if (!selected) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#374151';
              }
            }}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}

// ── Placeholder / disabled step ───────────────────────────────────────────────
function StepPlaceholder({ message }) {
  return (
    <div style={{ fontSize: 13, color: '#9ca3af', padding: '14px 16px', border: '1px dashed #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
      {message}
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ providerDisplayName, username, accentColor, accentTextColor }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', background: '#d1fae5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: '#111' }}>
        Booking request sent!
      </h2>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 32px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
        You'll receive a confirmation email once{' '}
        <strong>{providerDisplayName || 'the provider'}</strong> approves your booking.
      </p>
      <Link
        to={`/${username}`}
        style={{
          display: 'inline-block',
          padding: '10px 28px',
          background: accentColor || '#111',
          color: accentTextColor || '#fff',
          borderRadius: 6,
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        ← Back to {providerDisplayName || username}
      </Link>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function BookingPage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedService, setSelectedService] = useState(searchParams.get('serviceId') || '');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [guestInfo, setGuestInfo] = useState(INITIAL_GUEST);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [provider, setProvider] = useState(null);
  const [branding, setBranding] = useState({});

  const accent = branding.accentColor || '#111';
  const accentText = branding.accentTextColor || '#fff';

  useEffect(() => {
    api.get(`/public/providers/${username}`).then((res) => {
      setProvider(res.data.provider);
      setBranding(res.data.homePage?.branding || {});
    });
    api.get(`/public/providers/${username}/locations`).then((res) => setLocations(res.data));
    api.get(`/public/providers/${username}/services`).then((res) => setServices(res.data));
  }, [username]);

  useEffect(() => {
    if (!selectedLocation) { setAvailableDates([]); setSelectedDate(''); return; }
    setSelectedDate('');
    setSelectedSlot('');
    api.get(`/public/providers/${username}/available-dates`, {
      params: { locationId: selectedLocation, serviceId: selectedService || undefined, days: 60 },
    })
      .then((res) => setAvailableDates(res.data))
      .catch(() => setAvailableDates([]));
  }, [username, selectedLocation, selectedService]);

  useEffect(() => {
    if (!selectedDate || !selectedLocation || !selectedService) { setAvailableSlots([]); setSlotsError(false); return; }
    setSelectedSlot('');
    setSlotsLoading(true);
    setSlotsError(false);
    api.get(`/public/providers/${username}/available-slots`, {
      params: { locationId: selectedLocation, serviceId: selectedService, date: selectedDate },
    })
      .then((res) => { setAvailableSlots(res.data); setSlotsLoading(false); })
      .catch(() => { setAvailableSlots([]); setSlotsLoading(false); setSlotsError(true); });
  }, [username, selectedDate, selectedLocation, selectedService]);

  const filteredServices = services.filter(
    (s) => !selectedLocation || s.locations.some((l) => l._id === selectedLocation)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        providerId: provider._id,
        locationId: selectedLocation,
        serviceId: selectedService,
        date: selectedDate,
        startTime: selectedSlot,
        guestInfo: user ? null : guestInfo,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canPickDate = selectedLocation && selectedService;
  const canPickSlot = canPickDate && selectedDate;
  const canSubmit = selectedLocation && selectedService && selectedDate && selectedSlot;

  return (
    <div style={{ minHeight: '100vh', background: getPageBackground(branding) }}>
      <ProviderNavbar
        username={username}
        displayName={provider?.displayName}
        activeSection="bookings"
        branding={branding}
      />

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 20px 60px' }}>
        {submitted ? (
          <SuccessScreen
            providerDisplayName={provider?.displayName}
            username={username}
            accentColor={accent}
            accentTextColor={accentText}
          />
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 28px', color: '#111' }}>
              Book with {provider?.displayName || username}
            </h1>

            <form onSubmit={handleSubmit}>
              {/* Step 1 — Location & Service */}
              <div style={{ marginBottom: 28 }}>
                <div style={stepLabel(1, '1 — Location & Service', true)}>
                  <span style={stepNum(true)}>1</span>
                  Location &amp; Service
                </div>
                <label style={labelStyle}>Location</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {locations.map((l) => {
                    const sel = selectedLocation === l._id;
                    return (
                      <button
                        key={l._id}
                        type="button"
                        onClick={() => { setSelectedLocation(l._id); setSelectedService(''); }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          border: `1.5px solid ${sel ? accent : '#e5e7eb'}`,
                          background: sel ? accent : '#fff',
                          color: sel ? accentText : '#374151',
                          fontSize: 13,
                          fontWeight: sel ? 600 : 400,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'border-color 0.1s, background 0.1s',
                        }}
                        onMouseEnter={(e) => { if (!sel) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = '#f9fafb'; } }}
                        onMouseLeave={(e) => { if (!sel) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; } }}
                      >
                        <div style={{ fontWeight: sel ? 600 : 500, fontSize: 13 }}>{l.name}</div>
                        {l.city && <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>{l.city}</div>}
                      </button>
                    );
                  })}
                </div>

                <label style={{ ...labelStyle, opacity: !selectedLocation ? 0.5 : 1 }}>Service</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4, opacity: !selectedLocation ? 0.4 : 1, pointerEvents: !selectedLocation ? 'none' : 'auto' }}>
                  {filteredServices.length === 0 && selectedLocation && (
                    <span style={{ fontSize: 13, color: '#9ca3af' }}>No services available at this location.</span>
                  )}
                  {filteredServices.map((s) => {
                    const sel = selectedService === s._id;
                    return (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => { setSelectedService(s._id); setSelectedDate(''); setSelectedSlot(''); }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          border: `1.5px solid ${sel ? accent : '#e5e7eb'}`,
                          background: sel ? accent : '#fff',
                          color: sel ? accentText : '#374151',
                          fontSize: 13,
                          fontWeight: sel ? 600 : 400,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'border-color 0.1s, background 0.1s',
                        }}
                        onMouseEnter={(e) => { if (!sel) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = '#f9fafb'; } }}
                        onMouseLeave={(e) => { if (!sel) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; } }}
                      >
                        <div style={{ fontWeight: sel ? 600 : 500, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>
                          {s.durationMinutes} min{s.price ? ` · €${s.price}` : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 — Date */}
              <div style={{ marginBottom: 28 }}>
                <div style={stepLabel(2, '2 — Date', canPickDate)}>
                  <span style={stepNum(canPickDate)}>2</span>
                  Date
                </div>
                {!canPickDate ? (
                  <StepPlaceholder message="Select a location and service first" />
                ) : (
                  <>
                    <DatePicker
                      availableDates={availableDates}
                      selectedDate={selectedDate}
                      onSelect={(d) => setSelectedDate(d)}
                      accentColor={accent}
                    />
                    {availableDates.length === 0 && (
                      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 10 }}>
                        No availability in the next 60 days.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Step 3 — Time slot */}
              <div style={{ marginBottom: 28 }}>
                <div style={stepLabel(3, '3 — Time slot', canPickSlot)}>
                  <span style={stepNum(canPickSlot)}>3</span>
                  Time slot
                </div>
                {!canPickSlot ? (
                  <StepPlaceholder message="Select a date first" />
                ) : slotsError ? (
                  <div style={{ fontSize: 13, color: '#dc2626', padding: '14px 16px', border: '1px solid #fecaca', borderRadius: 8, background: '#fef2f2' }}>
                    Could not load time slots. Please try again.
                  </div>
                ) : (
                  <SlotPicker
                    slots={availableSlots}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                    accentColor={accent}
                    loading={slotsLoading}
                  />
                )}
              </div>

              {/* Step 4 — Guest details (unauthenticated only) */}
              {!user && (
                <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: 24, marginBottom: 24 }}>
                  <div style={stepLabel(4, '4 — Your details', true)}>
                    <span style={stepNum(true)}>4</span>
                    Your details
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 140px' }}>
                      <label style={labelStyle}>First name</label>
                      <input
                        placeholder="Jane"
                        required
                        value={guestInfo.firstName}
                        onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                        style={inputStyle}
                        {...fh}
                      />
                    </div>
                    <div style={{ flex: '1 1 140px' }}>
                      <label style={labelStyle}>Last name</label>
                      <input
                        placeholder="Doe"
                        required
                        value={guestInfo.lastName}
                        onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                        style={inputStyle}
                        {...fh}
                      />
                    </div>
                  </div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    style={inputStyle}
                    {...fh}
                  />
                  <label style={labelStyle}>Phone</label>
                  <input
                    placeholder="+1 555 000 0000"
                    required
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    style={{ ...inputStyle, marginBottom: 14 }}
                    {...fh}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', color: '#374151' }}>
                    <input
                      type="checkbox"
                      checked={guestInfo.isFirstTime}
                      onChange={(e) => setGuestInfo({ ...guestInfo, isFirstTime: e.target.checked })}
                      style={{ accentColor: accent, width: 15, height: 15 }}
                    />
                    First time with this provider?
                  </label>
                </div>
              )}

              {/* Submit error */}
              {submitError && (
                <div style={{ marginBottom: 16, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 13, color: '#dc2626' }}>
                  {submitError}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  background: !canSubmit ? '#e5e7eb' : accent,
                  color: !canSubmit ? '#9ca3af' : accentText,
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.8 : 1,
                  transition: 'background 0.1s',
                }}
              >
                {submitting ? 'Sending request...' : 'Request booking'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
