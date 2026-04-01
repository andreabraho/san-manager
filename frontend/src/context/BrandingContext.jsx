import { createContext, useContext } from 'react';

export const BrandingContext = createContext({});
export const useBranding = () => useContext(BrandingContext);

export const CARD_RADIUS = { none: 0, sm: 4, md: 8, lg: 14, xl: 24 };
export const CARD_SHADOW = {
  none: 'none',
  sm: '0 1px 4px rgba(0,0,0,0.08)',
  md: '0 4px 14px rgba(0,0,0,0.10)',
  lg: '0 10px 32px rgba(0,0,0,0.14)',
};

export const getPageBackground = (branding = {}) => {
  if (branding.pageBgType === 'gradient') {
    const from = branding.pageBgGradientFrom || '#ffffff';
    const to   = branding.pageBgGradientTo   || '#f3f4f6';
    const dir  = branding.pageBgGradientDir  || 'to bottom';
    return `linear-gradient(${dir}, ${from}, ${to})`;
  }
  if (branding.pageBgType === 'image' && branding.pageBgImage) {
    return `url(${branding.pageBgImage}) center/cover no-repeat fixed`;
  }
  return branding.pageBgColor || '#f9fafb';
};
