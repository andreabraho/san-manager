import { useEffect, useState } from 'react';
import api from '../../services/api';
import { connectGoogleCalendar } from '../../services/calendarIntegration';

// ── Design tokens ─────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:   { color: '#b45309', bg: '#fef3c7', border: '#fcd34d', label: 'Pending' },
  approved:  { color: '#065f46', bg: '#d1fae5', border: '#6ee7b7', label: 'Approved' },
  rejected:  { color: '#991b1b', bg: '#fee2e2', border: '#fca5a5', label: 'Rejected' },
  cancelled: { color: '#374151', bg: '#f3f4f6', border: '#d1d5db', label: 'Cancelled' },
};

const FILTERS = ['pending', 'approved', 'rejected', 'cancelled'];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Shared style helpers ──────────────────────────────────────────────────────
const S = {
  page: { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },
  pageTitle: { fontSize: 22, fontWeight: 700, margin: 0, color: '#111' },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '14px 16px',
    marginBottom: 10,
    background: '#fff',
  },
  outlineBtn: {
    padding: '5px 12px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 400,
    minHeight: 36,
  },
  approveBtn: {
    padding: '5px 12px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
    minHeight: 36,
  },
  rejectBtn: {
    padding: '5px 12px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
    minHeight: 36,
  },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.cancelled;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 600,
      color: meta.color,
      background: meta.bg,
      border: `1px solid ${meta.border}`,
      borderRadius: 6,
      padding: '2px 8px',
    }}>
      {meta.label}
    </span>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#111', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Loading bookings...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EmptyState({ status }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed #e5e7eb', borderRadius: 10 }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>
        {status === 'pending' ? '📋' : status === 'approved' ? '✓' : '—'}
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        No {status} bookings
      </div>
      <div style={{ fontSize: 13, color: '#9ca3af' }}>
        {status === 'pending'
          ? 'New booking requests will appear here.'
          : `Bookings marked as ${status} will appear here.`}
      </div>
    </div>
  );
}

// ── Calendar view ─────────────────────────────────────────────────────────────
function buildMonthGrid(year, month, bookings) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  const byDay = {};
  bookings.forEach((b) => {
    const d = new Date(b.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(b);
    }
  });

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, bookings: byDay[d] || [] });
  return cells;
}

function CalendarView({ allBookings, onUpdateStatus }) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const cells = buildMonthGrid(month.getFullYear(), month.getMonth(), allBookings);
  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  const selectedBookings = selectedDay
    ? allBookings
        .filter((b) => {
          const d = new Date(b.date);
          return (
            d.getFullYear() === month.getFullYear() &&
            d.getMonth() === month.getMonth() &&
            d.getDate() === selectedDay
          );
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];

  const isToday = (day) =>
    day === today.getDate() &&
    month.getMonth() === today.getMonth() &&
    month.getFullYear() === today.getFullYear();

  return (
    <div>
      {/* Google Calendar banner */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px',
        marginBottom: 20, background: '#f9fafb', flexWrap: 'wrap', gap: 10,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Google Calendar</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            Sync your bookings with Google Calendar
          </div>
        </div>
        <button
          onClick={connectGoogleCalendar}
          style={{ ...S.outlineBtn, fontSize: 13 }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
        >
          Connect ↗
        </button>
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={prevMonth}
          style={{ ...S.outlineBtn, padding: '5px 12px', fontSize: 16 }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
        >‹</button>
        <span style={{ fontWeight: 600, fontSize: 15, minWidth: 140, textAlign: 'center', color: '#111' }}>
          {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          style={{ ...S.outlineBtn, padding: '5px 12px', fontSize: 16 }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
        >›</button>
        <button
          onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(null); }}
          style={{ ...S.outlineBtn, marginLeft: 4, fontSize: 12, color: '#6b7280' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
        >
          Today
        </button>
      </div>

      {/* Day-name headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 1 }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#9ca3af', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: '#e5e7eb', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} style={{ background: '#f9fafb', minHeight: 52 }} />;
          const { day, bookings: dayBookings } = cell;
          const active = selectedDay === day;
          const todayFlag = isToday(day);
          return (
            <div
              key={day}
              onClick={() => setSelectedDay(active ? null : day)}
              style={{ background: active ? '#111' : '#fff', minHeight: 52, padding: '6px 4px', cursor: 'pointer' }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: todayFlag ? 700 : 400,
                background: todayFlag && !active ? '#111' : 'transparent',
                color: active ? '#fff' : todayFlag ? '#fff' : '#111',
                marginBottom: 2,
              }}>
                {day}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {dayBookings.slice(0, 2).map((b) => {
                  const meta = STATUS_META[b.status] || STATUS_META.cancelled;
                  return (
                    <div
                      key={b._id}
                      style={{
                        fontSize: 9, padding: '1px 3px', borderRadius: 3,
                        background: active ? 'rgba(255,255,255,0.2)' : meta.bg,
                        color: active ? '#fff' : meta.color,
                        whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%',
                      }}
                    >
                      {b.startTime}
                    </div>
                  );
                })}
                {dayBookings.length > 2 && (
                  <div style={{ fontSize: 9, color: active ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                    +{dayBookings.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected-day detail */}
      {selectedDay && (
        <div style={{ marginTop: 20, border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, background: '#fff' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: '#111' }}>
            {MONTH_NAMES[month.getMonth()]} {selectedDay} — {selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''}
          </h3>
          {selectedBookings.length === 0 && (
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>No bookings this day.</p>
          )}
          {selectedBookings.map((b) => {
            const name = b.guestInfo
              ? `${b.guestInfo.firstName} ${b.guestInfo.lastName}`
              : `${b.client?.firstName || ''} ${b.client?.lastName || ''}`.trim();
            const email = b.guestInfo?.email || b.client?.email;
            return (
              <div key={b._id} style={{ padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, color: '#111' }}>{b.startTime} — {b.service?.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {b.location?.name} · {name} · {email}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <StatusBadge status={b.status} />
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(b._id, 'approved')}
                          style={S.approveBtn}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                        >Approve</button>
                        <button
                          onClick={() => onUpdateStatus(b._id, 'rejected')}
                          style={S.rejectBtn}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                        >Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function BookingManager() {
  const [view, setView] = useState('list');
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const loadList = () => {
    setLoading(true);
    api.get('/bookings/provider', { params: { status: filter } })
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  };

  const loadAll = () =>
    api.get('/bookings/provider').then((res) => setAllBookings(res.data));

  useEffect(() => { loadList(); }, [filter]);
  useEffect(() => { if (view === 'calendar') loadAll(); }, [view]);

  const updateStatus = async (id, status) => {
    await api.patch(`/bookings/${id}/status`, { status });
    loadList();
    if (view === 'calendar') loadAll();
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={S.pageTitle}>Bookings</h1>
        {/* View toggle */}
        <div style={{ display: 'flex', gap: 2, border: '1px solid #e5e7eb', borderRadius: 8, padding: 3, background: '#fff' }}>
          {[['list', 'List'], ['calendar', 'Calendar']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '5px 14px',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                background: view === v ? '#111' : 'transparent',
                color: view === v ? '#fff' : '#6b7280',
                cursor: 'pointer',
                fontWeight: view === v ? 500 : 400,
                transition: 'background 0.1s',
                minHeight: 34,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List view */}
      {view === 'list' && (
        <>
          {/* Filter tabs — scrollable on mobile */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
            {FILTERS.map((s) => {
              const active = filter === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    borderBottom: active ? '2px solid #111' : '2px solid transparent',
                    background: 'transparent',
                    color: active ? '#111' : '#6b7280',
                    fontWeight: active ? 600 : 400,
                    fontSize: 13,
                    cursor: 'pointer',
                    marginBottom: -1,
                    transition: 'color 0.1s',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    minHeight: 40,
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>

          {loading ? (
            <LoadingState />
          ) : bookings.length === 0 ? (
            <EmptyState status={filter} />
          ) : (
            bookings.map((b) => {
              const name = b.guestInfo
                ? `${b.guestInfo.firstName} ${b.guestInfo.lastName}`
                : `${b.client?.firstName || ''} ${b.client?.lastName || ''}`.trim();
              const email = b.guestInfo?.email || b.client?.email;
              return (
                <div
                  key={b._id}
                  style={{
                    ...S.card,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                    gap: isMobile ? 10 : 0,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: '#111' }}>
                      {b.service?.name}
                      {b.location?.name && (
                        <span style={{ fontWeight: 400, color: '#6b7280' }}> — {b.location.name}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      {new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {b.startTime}
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
                      {name}{email ? ` · ${email}` : ''}
                    </div>
                    {b.guestInfo?.isFirstTime && (
                      <span style={{
                        display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 500,
                        color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe',
                        borderRadius: 5, padding: '1px 7px',
                      }}>
                        First visit
                      </span>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: 6,
                    alignItems: isMobile ? 'center' : 'flex-end',
                    marginLeft: isMobile ? 0 : 16,
                    flexShrink: 0,
                    flexWrap: 'wrap',
                  }}>
                    <StatusBadge status={b.status} />
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(b._id, 'approved')}
                          style={S.approveBtn}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                        >Approve</button>
                        <button
                          onClick={() => updateStatus(b._id, 'rejected')}
                          style={S.rejectBtn}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                        >Reject</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* Calendar view */}
      {view === 'calendar' && (
        <CalendarView allBookings={allBookings} onUpdateStatus={updateStatus} />
      )}
    </div>
  );
}
