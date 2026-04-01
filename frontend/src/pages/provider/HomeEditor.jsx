import { useEffect, useState } from 'react';
import api from '../../services/api';
import GridLayout from '../../components/layout/GridLayout';
import ProviderNavbar from '../../components/layout/ProviderNavbar';
import BrandingEditor from '../../components/layout/BrandingEditor';
import { useAuth } from '../../context/AuthContext';
import { getPageBackground } from '../../context/BrandingContext';


const DEFAULT_BRANDING = {
  logoText: '',
  logoUrl: '',
  bgColor: '#ffffff',
  textColor: '#111111',
  accentColor: '#111111',
  accentTextColor: '#ffffff',
  fontFamily: 'system',
  pageBgType: 'solid',
  pageBgColor: '#f9fafb',
  pageBgGradientFrom: '#ffffff',
  pageBgGradientTo: '#f3f4f6',
  pageBgGradientDir: 'to bottom',
  pageBgImage: '',
  cardRadius: 'md',
  cardShadow: 'sm',
  cardBg: '#ffffff',
};

function Btn({ children, active, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        fontSize: 13,
        background: active ? '#111' : '#fff',
        color: active ? '#fff' : '#374151',
        cursor: 'pointer',
        fontWeight: active ? 500 : 400,
        transition: 'background 0.1s, color 0.1s',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#f9fafb';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active ? '#111' : '#fff';
        e.currentTarget.style.color = active ? '#fff' : '#374151';
      }}
    >
      {children}
    </button>
  );
}

export default function HomeEditor() {
  const { user } = useAuth();
  const [homePage, setHomePage] = useState(null);
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [enabledTypes, setEnabledTypes] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [showBranding, setShowBranding] = useState(false);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  useEffect(() => {
    api.get('/provider/homepage').then((res) => {
      setHomePage(res.data);
      if (res.data.branding) {
        setBranding({ ...DEFAULT_BRANDING, ...res.data.branding });
      }
    });
  }, []);

  const handleSave = async (widgets) => {
    setSaveError(null);
    try {
      await api.put('/provider/homepage', { widgets, cols: homePage?.cols || 12, branding });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Save failed. Please try again.');
    }
  };

  if (!homePage) {
    return (
      <div style={{ padding: '40px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 20, height: 20, border: '2px solid #e5e7eb', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
        <span style={{ fontSize: 14, color: '#6b7280' }}>Loading editor...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : 'calc(100vh - 52px)' }}>
      {/* Main editor area */}
      <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111' }}>Home Editor</h1>
            {previewing && (
              <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 5, fontWeight: 500 }}>
                Preview
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {saved && (
              <span style={{ fontSize: 13, color: '#10b981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Saved
              </span>
            )}
            {saveError && (
              <span style={{ fontSize: 13, color: '#ef4444' }}>{saveError}</span>
            )}
            <Btn
              active={showBranding}
              onClick={() => { setShowBranding(!showBranding); setPreviewing(false); }}
            >
              Branding
            </Btn>
            <Btn
              active={previewing}
              onClick={() => { setPreviewing(!previewing); setShowBranding(false); }}
            >
              {previewing ? 'Back' : 'Preview'}
            </Btn>
            {user?.username && !isMobile && (
              <a
                href={`/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '6px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#6b7280',
                  textDecoration: 'none',
                  background: '#fff',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                Open site ↗
              </a>
            )}
          </div>
        </div>

        {/* Navbar preview */}
        {(previewing || showBranding) && (
          <div style={{ padding: '12px 20px 0' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', padding: '4px 10px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Navbar preview
              </div>
              <ProviderNavbar
                username={user?.username || 'preview'}
                displayName={branding.logoText || user?.username}
                activeSection="home"
                branding={branding}
              />
            </div>
          </div>
        )}

        {/* Grid area */}
        <div
          style={{
            padding: '16px 20px 40px',
            borderRadius: (previewing || showBranding) ? 10 : 0,
            background: (previewing || showBranding) ? getPageBackground(branding) : undefined,
            margin: (previewing || showBranding) ? '12px 20px 20px' : 0,
            border: (previewing || showBranding) ? '1px solid #e5e7eb' : 'none',
            minHeight: 300,
          }}
        >
          <GridLayout
            widgets={homePage.widgets}
            isEditing={!previewing && !showBranding}
            cols={homePage.cols || 12}
            onSave={handleSave}
            enabledTypes={enabledTypes}
            providerUsername={user?.username}
            branding={branding}
          />
        </div>
      </div>

      {/* Branding sidebar */}
      {showBranding && (
        <div style={{
          width: isMobile ? '100%' : 320,
          borderLeft: isMobile ? 'none' : '1px solid #e5e7eb',
          borderTop: isMobile ? '1px solid #e5e7eb' : 'none',
          background: '#fff',
          overflow: 'auto',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            background: '#fff',
            zIndex: 10,
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#111' }}>Branding</h2>
            <button
              onClick={() => setShowBranding(false)}
              style={{
                background: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: 16,
                lineHeight: 1,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              ×
            </button>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <BrandingEditor branding={branding} onChange={setBranding} />
          </div>
        </div>
      )}
    </div>
  );
}
