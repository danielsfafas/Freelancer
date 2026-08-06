import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/apiBase';

export const DEFAULT_PAGE_TITLE =
  'Desarrollador web y IoT en Tepeapulco Hidalgo | Daniel Ortega — Dany Solutions';

function iconMimeFromHref(href) {
  const path = href.split(/[?#]/)[0].toLowerCase();
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.ico')) return 'image/x-icon';
  return 'image/png';
}

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const u = url.trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('blob:')) {
    if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && u.startsWith('http://')) {
      return u.replace(/^http:\/\//i, 'https://');
    }
    return u;
  }
  if (u.startsWith('/')) return `${API_URL}${u}`;
  return `${API_URL}/${u}`;
}

function setBrowserTabIcon(iconHref) {
  const mime = iconMimeFromHref(iconHref);

  let icon = document.querySelector("link[rel='icon']");
  if (!icon) {
    icon = document.createElement('link');
    icon.rel = 'icon';
    document.head.appendChild(icon);
  }
  icon.href = iconHref;
  icon.type = mime;

  let shortcut = document.querySelector("link[rel='shortcut icon']");
  if (!shortcut) {
    shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    document.head.appendChild(shortcut);
  }
  shortcut.href = iconHref;
  shortcut.type = mime;

  let apple = document.querySelector("link[rel='apple-touch-icon']");
  if (!apple) {
    apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    document.head.appendChild(apple);
  }
  apple.href = iconHref;
}

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/profile`);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const title = profile?.name?.trim()
      ? `${profile.name.trim()} | Desarrollador web Tepeapulco Hidalgo`
      : DEFAULT_PAGE_TITLE;
    document.title = title;

    const logo = profile?.logo_url && String(profile.logo_url).trim();
    if (logo) {
      const href = resolveMediaUrl(logo);
      if (href) {
        try {
          setBrowserTabIcon(href);
        } catch {
          /* ignore */
        }
      }
    }
  }, [profile]);

  return (
    <BrandingContext.Provider value={{ profile, loading, refresh, logoUrl: profile?.logo_url || null }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error('useBranding debe usarse dentro de BrandingProvider');
  }
  return ctx;
}
