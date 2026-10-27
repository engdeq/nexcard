export function buildVCard(content) {
  const escape = (v) =>
    String(v || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');

  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escape(content.fullName)}`];
  if (content.company) lines.push(`ORG:${escape(content.company)}`);
  if (content.jobTitle) lines.push(`TITLE:${escape(content.jobTitle)}`);
  if (content.phone) lines.push(`TEL;TYPE=CELL:${escape(content.phone)}`);
  if (content.email) lines.push(`EMAIL:${escape(content.email)}`);
  if (content.website) lines.push(`URL:${escape(content.website)}`);
  if (content.address) lines.push(`ADR;TYPE=WORK:;;${escape(content.address)};;;;`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

export function buildWifiPayload(content) {
  const escape = (v) => String(v || '').replace(/([\\;,:"])/g, '\\$1');
  const enc =
    content.security === 'None' || content.security === 'nopass'
      ? 'nopass'
      : content.security || 'WPA';
  const pass = enc === 'nopass' ? '' : `P:${escape(content.password)};`;
  return `WIFI:T:${enc};S:${escape(content.ssid)};${pass};`;
}

export function buildQrPayload(type, content = {}) {
  switch (type) {
    case 'website':
    case 'pdf':
    case 'image':
    case 'app':
    case 'menu':
    case 'business':
      return content.url || '';
    case 'text':
      return content.text || '';
    case 'vcard':
      return buildVCard(content);
    case 'wifi':
      return buildWifiPayload(content);
    case 'social':
      if (content.url) return content.url;
      return (content.links || [])
        .map((l) => `${l.platform}: ${l.url}`)
        .join('\n');
    default:
      return content.url || content.text || '';
  }
}

export function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateQrForm(type, content) {
  switch (type) {
    case 'website':
    case 'pdf':
    case 'image':
    case 'app':
    case 'menu':
    case 'business':
      if (!content.url?.trim()) return 'URL is required';
      if (!isValidHttpUrl(content.url)) return 'Enter a valid http(s) URL';
      return null;
    case 'text':
      if (!content.text?.trim()) return 'Text is required';
      return null;
    case 'vcard':
      if (!content.fullName?.trim()) return 'Full name is required';
      return null;
    case 'wifi':
      if (!content.ssid?.trim()) return 'Network name (SSID) is required';
      return null;
    case 'social':
      if (!content.url?.trim()) return 'Social profile URL is required';
      if (!isValidHttpUrl(content.url)) return 'Enter a valid http(s) URL';
      return null;
    default:
      return 'Invalid type';
  }
}

export const QR_TYPE_META = [
  {
    type: 'website',
    title: 'Website URL',
    description: 'Generate a QR code for any website.',
    icon: 'Globe',
  },
  {
    type: 'vcard',
    title: 'vCard',
    description: 'Create a digital business card.',
    icon: 'Contact',
  },
  {
    type: 'pdf',
    title: 'PDF',
    description: 'Link to a PDF document.',
    icon: 'FileText',
  },
  {
    type: 'image',
    title: 'Images',
    description: 'Link to an image gallery or image URL.',
    icon: 'Image',
  },
  {
    type: 'social',
    title: 'Social Media',
    description: 'Create a QR code for social media links.',
    icon: 'Share2',
  },
  {
    type: 'wifi',
    title: 'Wi-Fi',
    description: 'Generate a QR code for Wi-Fi access.',
    icon: 'Wifi',
  },
  {
    type: 'text',
    title: 'Simple Text',
    description: 'Generate a QR code containing text.',
    icon: 'Type',
  },
  {
    type: 'business',
    title: 'Business Page',
    description: 'Link to a public business profile.',
    icon: 'Briefcase',
  },
  {
    type: 'app',
    title: 'App',
    description: 'Link to an application download page.',
    icon: 'Smartphone',
  },
  {
    type: 'menu',
    title: 'Menu',
    description: 'Create a digital restaurant menu link.',
    icon: 'UtensilsCrossed',
  },
];
