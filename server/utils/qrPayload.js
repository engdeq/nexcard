export function buildVCard({
  fullName,
  company,
  jobTitle,
  phone,
  email,
  website,
  address,
}) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(fullName || '')}`,
  ];

  if (company || jobTitle) {
    lines.push(`ORG:${escapeVCard(company || '')}`);
    if (jobTitle) lines.push(`TITLE:${escapeVCard(jobTitle)}`);
  }
  if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);
  if (email) lines.push(`EMAIL:${escapeVCard(email)}`);
  if (website) lines.push(`URL:${escapeVCard(website)}`);
  if (address) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(address)};;;;`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

function escapeVCard(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildWifiPayload({ ssid, password, security = 'WPA', hidden = false }) {
  const enc = security === 'None' || security === 'nopass' ? 'nopass' : security;
  const escapedSsid = escapeWifi(ssid || '');
  const escapedPass = enc === 'nopass' ? '' : escapeWifi(password || '');
  const hiddenFlag = hidden ? 'H:true;' : '';
  return `WIFI:T:${enc};S:${escapedSsid};${enc === 'nopass' ? '' : `P:${escapedPass};`}${hiddenFlag};`;
}

function escapeWifi(value) {
  return String(value).replace(/([\\;,:"])/g, '\\$1');
}

export function buildQrContent(type, content = {}) {
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
    case 'social': {
      const links = content.links || [];
      if (content.url) return content.url;
      return links.map((l) => `${l.platform}: ${l.url}`).join('\n');
    }
    default:
      return content.url || content.text || JSON.stringify(content);
  }
}
