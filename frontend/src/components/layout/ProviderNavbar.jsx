import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Home',     key: 'home' },
  { label: 'Gallery',  key: 'gallery' },
  { label: 'Bookings', key: 'bookings' },
];

const FONT_MAP = {
  system:     '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  inter:      '"Inter", sans-serif',
  montserrat: '"Montserrat", sans-serif',
  playfair:   '"Playfair Display", serif',
  serif:      'Georgia, "Times New Roman", serif',
  mono:       '"Courier New", Courier, monospace',
};

const GOOGLE_FONTS = {
  inter:      'Inter',
  montserrat: 'Montserrat',
  playfair:   'Playfair+Display',
};

function getInitials(username) {
  if (!username) return '?';
  const parts = username.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function getAvatarColor(username) {
  const colors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];
  let hash = 0;
  for (let i = 0; i < (username || '').length; i++) hash += username.charCodeAt(i);
  return colors[hash % colors.length];
}

export default function ProviderNavbar({ username, displayName, activeSection = 'home', branding = {} }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const {
    logoText        = '',
    logoUrl         = '',
    bgColor         = '#ffffff',
    textColor       = '#111111',
    accentColor     = '#111111',
    accentTextColor = '#ffffff',
    fontFamily      = 'system',
  } = branding;

  const isClient = user?.role === 'client';
  const initials = getInitials(user?.username);
  const avatarBg = isClient ? (branding.accentColor || '#111') : getAvatarColor(user?.username);

  const handleLogout = () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  useEffect(() => {
    if (GOOGLE_FONTS[fontFamily]) {
      const id = `gfont-${fontFamily}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS[fontFamily]}:wght@400;500;700&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [fontFamily]);

  // Close mobile nav on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false);
  }, [isMobile]);

  const handleNav = (key) => {
    setMobileNavOpen(false);
    if (key === 'bookings') {
      navigate(`/${username}/book`);
    } else {
      navigate(`/${username}`);
    }
  };

  const ff = FONT_MAP[fontFamily] || FONT_MAP.system;

  // Subtle active background derived from accent color
  const activeBg = bgColor === '#ffffff' || bgColor === '#fff'
    ? '#f3f4f6'
    : `${accentColor}28`;

  const mutedColor = textColor + 'aa';
  const borderColor = bgColor === '#ffffff' || bgColor === '#fff'
    ? '#e5e7eb'
    : `${textColor}22`;

  return (
    <nav style={{
      borderBottom: `1px solid ${borderColor}`,
      background: bgColor,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: ff,
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
          to={`/${username}`}
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: textColor,
            letterSpacing: '-0.3px',
            marginRight: 12,
            textDecoration: 'none',
            flexShrink: 0,
            fontFamily: ff,
          }}
        >
          {logoUrl
            ? <img src={logoUrl} alt={logoText || displayName || username} style={{ height: 28, objectFit: 'contain', display: 'block' }} />
            : (logoText || displayName || username)
          }
        </Link>

        {/* Desktop nav items */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 2, flex: 1 }}>
            {NAV_ITEMS.map(({ label, key }) => {
              const active = activeSection === key;
              return (
                <button
                  key={key}
                  onClick={() => handleNav(key)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? textColor : mutedColor,
                    background: active ? activeBg : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: ff,
                    transition: 'background 0.1s, color 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = activeBg;
                      e.currentTarget.style.color = textColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = mutedColor;
                    }
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Spacer on mobile */}
        {isMobile && <div style={{ flex: 1 }} />}

        {/* Book now CTA — always visible */}
        <Link
          to={`/${username}/book`}
          style={{
            padding: isMobile ? '7px 12px' : '7px 16px',
            background: accentColor,
            color: accentTextColor,
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
            fontFamily: ff,
            transition: 'opacity 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          Book now
        </Link>

        {/* Account area */}
        {isClient ? (
          <div ref={menuRef} style={{ position: 'relative', flexShrink: 0, marginLeft: 4 }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              title={user.username}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: avatarBg,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
                transition: 'opacity 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {initials}
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 228,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                zIndex: 200,
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: avatarBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.username}
                      </div>
                      {user.email && (
                        <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '6px 0' }}>
                  <Link
                    to="/my-bookings"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 16px',
                      textDecoration: 'none',
                      fontSize: 13,
                      color: '#374151',
                      fontFamily: ff,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    My Bookings
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 16px',
                      textDecoration: 'none',
                      fontSize: 13,
                      color: '#374151',
                      fontFamily: ff,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Profile &amp; settings
                  </Link>

                  <div style={{ margin: '4px 0', borderTop: '1px solid #f3f4f6' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      fontSize: 13,
                      color: '#ef4444',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: ff,
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
        ) : (
          <Link
            to="/login"
            style={{
              padding: '6px 14px',
              background: 'transparent',
              color: textColor,
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              flexShrink: 0,
              fontFamily: ff,
              border: `1px solid ${borderColor}`,
              marginLeft: 4,
              transition: 'background 0.1s, border-color 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = activeBg;
              e.currentTarget.style.borderColor = textColor + '44';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = borderColor;
            }}
          >
            Sign in
          </Link>
        )}

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
              border: `1px solid ${borderColor}`,
              borderRadius: 6,
              cursor: 'pointer',
              padding: 6,
              flexShrink: 0,
              marginLeft: 4,
            }}
          >
            <span style={{ display: 'block', width: 18, height: 2, background: textColor, borderRadius: 2 }} />
            <span style={{ display: 'block', width: 18, height: 2, background: textColor, borderRadius: 2 }} />
            <span style={{ display: 'block', width: 18, height: 2, background: textColor, borderRadius: 2 }} />
          </button>
        )}
      </div>

      {/* Mobile dropdown nav */}
      {isMobile && mobileNavOpen && (
        <div style={{
          borderTop: `1px solid ${borderColor}`,
          background: bgColor,
          padding: '8px 0 12px',
        }}>
          {NAV_ITEMS.map(({ label, key }) => {
            const active = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => handleNav(key)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: active ? `2px solid ${accentColor}` : '2px solid transparent',
                  background: active ? activeBg : 'transparent',
                  color: active ? textColor : mutedColor,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: ff,
                  minHeight: 44,
                }}
              >
                {label}
              </button>
            );
          })}

          {/* Mobile account area */}
          {isClient && (
            <div style={{ padding: '10px 20px 4px', borderTop: `1px solid ${borderColor}`, marginTop: 6 }}>
              <div style={{ fontSize: 12, color: mutedColor, marginBottom: 6, fontFamily: ff }}>
                Signed in as <strong style={{ color: textColor }}>{user.username}</strong>
              </div>
              <Link
                to="/my-bookings"
                onClick={() => setMobileNavOpen(false)}
                style={{ display: 'block', fontSize: 13, color: textColor, padding: '6px 0', textDecoration: 'none', fontFamily: ff, minHeight: 44, lineHeight: '44px' }}
              >
                My Bookings
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileNavOpen(false)}
                style={{ display: 'block', fontSize: 13, color: textColor, padding: '6px 0', textDecoration: 'none', fontFamily: ff, minHeight: 44, lineHeight: '44px' }}
              >
                Profile &amp; settings
              </Link>
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
                  fontFamily: ff,
                  minHeight: 44,
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
