/**
 * Google reCAPTCHA v2 checkbox.
 */

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark';
        },
      ) => number;
      reset: (widgetId?: number) => void;
    };
    onSpinzoneRecaptchaLoad?: () => void;
  }
}

interface Props {
  siteKey: string;
  onChange: (token: string | null) => void;
  className?: string;
}

let scriptPromise: Promise<void> | null = null;

function loadRecaptchaScript(): Promise<void> {
  if (window.grecaptcha?.render) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    window.onSpinzoneRecaptchaLoad = () => resolve();
    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      const poll = () => {
        if (window.grecaptcha?.render) resolve();
        else window.setTimeout(poll, 50);
      };
      poll();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onSpinzoneRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export default function RecaptchaWidget({ siteKey, onChange, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    onChange(null);
    setLoadError(null);
    widgetIdRef.current = null;

    if (!siteKey || siteKey.length < 10) {
      setLoadError('CAPTCHA site key is missing. Check server/.env');
      return;
    }

    let cancelled = false;

    loadRecaptchaScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.grecaptcha) return;

        containerRef.current.innerHTML = '';

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token: string) => {
            setLoadError(null);
            onChange(token);
          },
          'expired-callback': () => onChange(null),
          'error-callback': () => {
            setLoadError('CAPTCHA error. Check that your site key is reCAPTCHA v2 and allows localhost.');
            onChange(null);
          },
        });
      })
      .catch(() => {
        setLoadError('Could not load Google reCAPTCHA. Check your internet connection.');
        onChange(null);
      });

    return () => {
      cancelled = true;
    };
  }, [siteKey, onChange]);

  return (
    <div className={className}>
      {loadError && (
        <p className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {loadError}
        </p>
      )}
      <div ref={containerRef} className="flex min-h-[78px] justify-center" />
    </div>
  );
}

export function resetRecaptchaWidget() {
  if (window.grecaptcha) {
    try {
      window.grecaptcha.reset();
    } catch {
      /* not mounted */
    }
  }
}
