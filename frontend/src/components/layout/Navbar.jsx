import { useRef, useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = {
  provider: [
    { label: 'Dashboard',    to: '/provider/dashboard' },
    { label: 'Bookings',     to: '/provider/bookings' },
    { label: 'Locations',    to: '/provider/locations' },
    { label: 'Services',     to: '/provider/services' },
    { label: 'Availability', to: '/provider/availability' },
    { label: 'Home Editor',  to: '/provider/home-editor' },
  ],
  client: [
    { label: 'Dashboard',   to: '/client/dashboard' },
    { label: 'My Bookings', to: '/client/bookings' },
  ],
  superadmin: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Users',     to: '/admin/users' },
    { label: 'Widgets',   to: '/admin/widgets' },
  ],
};

const ROLE_BADGE = {
  provider:   { label: 'Provider',   bg: '#eff6ff', color: '#1d4ed8' },
  client:     { label: 'Client',     bg: '#f0fdf4', color: '#15803d' },
  superadmin: { label: 'Admin',      bg: '#faf5ff', color: '#7e22ce' },
};

function getInitials(user) {
  if (user?.firstName && user?.lastName) return (user.firstName[0] + user.lastName[0]).toUpperCase();
  const name = user?.username || user?.firstName || user?.email || '';
  if (!name) return '?';
  const parts = name.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(username) {
  const colors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];
  let hash = 0;
  for (let i = 0; i < (username || '').length; i++) hash += username.charCodeAt(i);
  return colors[hash % colors.length];
}

function NavItem({ label, to, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        padding: '5px 10px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? '#111' : '#6b7280',
        background: active ? '#f3f4f6' : 'transparent',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'color 0.1s, background 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#111';
          e.currentTarget.style.background = '#f9fafb';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#6b7280';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const links = NAV_LINKS[user?.role] || [];
  const badge = ROLE_BADGE[user?.role];
  const initials = getInitials(user);
  const avatarColor = getAvatarColor(user?.username || user?.email || '');
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : (user?.username || user?.email || '');

  const isProviderZone = user?.role === 'provider' || user?.role === 'superadmin';

  const handleLogout = () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
    logout();
    navigate(isProviderZone ? '/provider/login' : '/login');
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  // Close mobile nav on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false);
  }, [isMobile]);

  return (
    <nav style={{
      borderBottom: '1px solid #e5e7eb',
      background: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Main bar */}
      <div style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 8,
      }}>
        {/* Logo */}
        <Link
          to={links[0]?.to || '/'}
          style={{
            fontWeight: 800,
            fontSize: 14,
            color: '#111',
            textDecoration: 'none',
            marginRight: 12,
            letterSpacing: '-0.4px',
            flexShrink: 0,
          }}
        >
          sanmanager
        </Link>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto' }}>
            {links.map(({ label, to }) => (
              <NavItem key={to} label={label} to={to} />
            ))}
          </div>
        )}

        {/* Spacer on mobile */}
        {isMobile && <div style={{ flex: 1 }} />}

        {/* User menu — always visible */}
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px 4px 4px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: menuOpen ? '#f9fafb' : '#fff',
              cursor: 'pointer',
              transition: 'background 0.1s, border-color 0.1s',
            }}
            onMouseEnter={(e) => { if (!menuOpen) e.currentTarget.style.borderColor = '#d1d5db'; }}
            onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.borderColor = '#e5e7eb'; }}
          >
            {/* Avatar */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
            {/* Name + role — hide on very small screens */}
            {!isMobile && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.2 }}>
                  {displayName}
                </div>
                {badge && (
                  <div style={{ fontSize: 10, fontWeight: 500, color: badge.color, lineHeight: 1.2 }}>
                    {badge.label}
                  </div>
                )}
              </div>
            )}
            {/* Chevron */}
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              style={{ marginLeft: 2, transition: 'transform 0.15s', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: '#9ca3af' }}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              width: 224,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              zIndex: 200,
              overflow: 'hidden',
            }}>
              {/* User info header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: avatarColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{displayName}</div>
                    {badge && (
                      <span style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 500,
                        color: badge.color, background: badge.bg,
                        padding: '1px 7px', borderRadius: 10, marginTop: 2,
                      }}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px 0' }}>
                <NavLink
                  to={isProviderZone ? '/provider/profile' : '/profile'}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 16px', textDecoration: 'none',
                    fontSize: 13, color: '#374151',
                    background: isActive ? '#f3f4f6' : 'transparent',
                  })}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile &amp; settings
                </NavLink>

                {user?.role === 'provider' && user?.username && (
                  <a
                    href={`/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 16px', textDecoration: 'none',
                      fontSize: 13, color: '#374151',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    View my site
                  </a>
                )}

                <div style={{ margin: '4px 0', borderTop: '1px solid #f3f4f6' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '8px 16px', background: 'none', border: 'none',
                    fontSize: 13, color: '#ef4444', cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hamburger button — mobile only */}
        {isMobile && (
          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label="Toggle navigation"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 5,
              width: 36,
              height: 36,
              background: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              cursor: 'pointer',
              padding: 6,
              flexShrink: 0,
            }}
          >
            <span style={{ display: 'block', width: 18, height: 2, background: '#374151', borderRadius: 2, transition: 'opacity 0.1s' }} />
            <span style={{ display: 'block', width: 18, height: 2, background: '#374151', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 18, height: 2, background: '#374151', borderRadius: 2 }} />
          </button>
        )}
      </div>

      {/* Mobile dropdown nav */}
      {isMobile && mobileNavOpen && (
        <div style={{
          borderTop: '1px solid #e5e7eb',
          background: '#fff',
          padding: '8px 0 12px',
        }}>
          {links.map(({ label, to }) => (
            <NavItem
              key={to}
              label={label}
              to={to}
              onClick={() => setMobileNavOpen(false)}
            />
          ))}
          {/* Mobile user info row */}
          <div style={{ padding: '10px 16px 4px', borderTop: '1px solid #f3f4f6', marginTop: 6 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>
              Signed in as <strong style={{ color: '#374151' }}>{displayName}</strong>
            </div>
            <NavLink
              to={isProviderZone ? '/provider/profile' : '/profile'}
              onClick={() => setMobileNavOpen(false)}
              style={{ display: 'block', fontSize: 13, color: '#374151', padding: '6px 0', textDecoration: 'none' }}
            >
              Profile &amp; settings
            </NavLink>
            {user?.role === 'provider' && user?.username && (
              <a
                href={`/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileNavOpen(false)}
                style={{ display: 'block', fontSize: 13, color: '#374151', padding: '6px 0', textDecoration: 'none' }}
              >
                View my site ↗
              </a>
            )}
            <button
              onClick={handleLogout}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                fontSize: 13,
                color: '#ef4444',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 0',
                marginTop: 2,
              }}
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
