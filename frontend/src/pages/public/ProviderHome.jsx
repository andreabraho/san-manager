import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import GridLayout from '../../components/layout/GridLayout';
import ProviderNavbar from '../../components/layout/ProviderNavbar';
import { getPageBackground } from '../../context/BrandingContext';

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function NotFoundScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', gap: 12, padding: 24 }}>
      <div style={{ fontSize: 48, fontWeight: 800, color: '#e5e7eb', letterSpacing: '-2px' }}>404</div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Provider not found</h1>
      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
        This page doesn't exist or may have been removed.
      </p>
    </div>
  );
}

export default function ProviderHome() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/providers/${username}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <LoadingScreen />;
  if (!data)   return <NotFoundScreen />;

  const branding = data.homePage?.branding || {};

  return (
    <div style={{ minHeight: '100vh', background: getPageBackground(branding) }}>
      <ProviderNavbar
        username={username}
        displayName={data.provider?.displayName}
        activeSection="home"
        branding={branding}
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px 60px' }}>
        <GridLayout
          widgets={data.homePage?.widgets || []}
          isEditing={false}
          cols={data.homePage?.cols || 12}
          providerUsername={username}
          branding={branding}
        />
        {(!data.homePage?.widgets || data.homePage.widgets.length === 0) && (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9ca3af', fontSize: 14 }}>
            This provider hasn't set up their page yet.
          </div>
        )}
      </div>
    </div>
  );
}
