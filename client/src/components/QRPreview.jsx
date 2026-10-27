import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Spinner } from './ui';

export function QRPreview({
  payload,
  foregroundColor = '#111827',
  backgroundColor = '#FFFFFF',
  size = 220,
  className = '',
}) {
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!payload) {
      setDataUrl('');
      setError('');
      return undefined;
    }

    setLoading(true);
    QRCode.toDataURL(payload, {
      width: size * 2,
      margin: 2,
      color: { dark: foregroundColor, light: backgroundColor },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not generate QR code');
          setDataUrl('');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [payload, foregroundColor, backgroundColor, size]);

  if (!payload) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-dashed border-border bg-bg text-sm text-muted ${className}`}
        style={{ width: size, height: size }}
      >
        Preview
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-border bg-white ${className}`}
        style={{ width: size, height: size }}
      >
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-500 ${className}`}
        style={{ width: size, height: size }}
      >
        {error}
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR code preview"
      width={size}
      height={size}
      className={`rounded-2xl border border-border bg-white ${className}`}
    />
  );
}

export async function downloadQrPng(payload, filename, colors = {}) {
  const url = await QRCode.toDataURL(payload, {
    width: 1024,
    margin: 2,
    color: {
      dark: colors.foregroundColor || '#111827',
      light: colors.backgroundColor || '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || 'nexacard-qr'}.png`;
  a.click();
}

export async function downloadQrSvg(payload, filename, colors = {}) {
  const svg = await QRCode.toString(payload, {
    type: 'svg',
    margin: 2,
    color: {
      dark: colors.foregroundColor || '#111827',
      light: colors.backgroundColor || '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || 'nexacard-qr'}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}
