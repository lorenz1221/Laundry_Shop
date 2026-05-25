import { useEffect, useState } from 'react';

export interface RecaptchaConfig {
  enabled: boolean;
  siteKey: string;
  loading: boolean;
}

export function useRecaptchaConfig(): RecaptchaConfig {
  const [config, setConfig] = useState<RecaptchaConfig>({
    enabled: false,
    siteKey: '',
    loading: true,
  });

  useEffect(() => {
    fetch('/api/recaptcha/site-key', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: { siteKey?: string; enabled?: boolean }) => {
        const siteKey = (data.siteKey ?? import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '').trim();
        setConfig({
          siteKey,
          enabled: Boolean(data.enabled && siteKey.length > 10),
          loading: false,
        });
      })
      .catch(() => {
        const siteKey = String(import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '').trim();
        setConfig({
          siteKey,
          enabled: false,
          loading: false,
        });
      });
  }, []);

  return config;
}
