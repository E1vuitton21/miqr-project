export interface WifiPayloadOptions {
  ssid: string;
  security: 'WPA' | 'WEP' | 'nopass';
  password?: string;
  hidden?: boolean;
}

export interface VCardPayloadOptions {
  fullName: string;
  phone?: string;
  email?: string;
  organization?: string;
  title?: string;
  url?: string;
}

export function formatWifiPayload(options: WifiPayloadOptions): string {
  const { ssid, security, password = '', hidden = false } = options;
  return `WIFI:S:${ssid};T:${security};P:${password};${hidden ? 'H:true;' : ''};`;
}

export function formatVCardPayload(options: VCardPayloadOptions): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];
  if (options.fullName) lines.push(`FN:${options.fullName}`);
  if (options.phone) lines.push(`TEL:${options.phone}`);
  if (options.email) lines.push(`EMAIL:${options.email}`);
  if (options.organization) lines.push(`ORG:${options.organization}`);
  if (options.title) lines.push(`TITLE:${options.title}`);
  if (options.url) lines.push(`URL:${options.url}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

export function formatEmailPayload(email: string, subject = '', body = ''): string {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ''}`;
}

export function formatPhonePayload(phone: string): string {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return `tel:${cleanPhone}`;
}
