import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Alert, Input, Select, Textarea } from './ui';
import { api, assetUrl } from '../services/api';

async function handleUpload(file, onUrl, setError, setUploading) {
  if (!file) return;
  setError('');
  setUploading(true);
  try {
    const res = await api.upload(file);
    const full = assetUrl(res.data.url);
    // Use absolute URL for QR content so scanners can open it
    const absolute =
      full.startsWith('http')
        ? full
        : `${window.location.origin}${res.data.url}`;
    onUrl(absolute);
  } catch (err) {
    setError(err.message || 'Upload failed');
  } finally {
    setUploading(false);
  }
}

export function QrTypeForm({ type, content, onChange }) {
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const set = (patch) => onChange({ ...content, ...patch });

  if (type === 'website' || type === 'app' || type === 'business') {
    return (
      <Input
        label={type === 'app' ? 'App download URL' : type === 'business' ? 'Business page URL' : 'Website URL'}
        type="url"
        placeholder="https://example.com"
        value={content.url || ''}
        onChange={(e) => set({ url: e.target.value })}
      />
    );
  }

  if (type === 'pdf') {
    return (
      <div className="space-y-4">
        <Input
          label="PDF URL"
          type="url"
          placeholder="https://example.com/file.pdf"
          value={content.url || ''}
          onChange={(e) => set({ url: e.target.value })}
        />
        <div>
          <p className="mb-1.5 text-sm font-medium text-text">Or upload a PDF</p>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-bg px-4 py-3 text-sm text-muted hover:border-primary hover:text-primary">
            <Upload size={16} />
            {uploading ? 'Uploading…' : 'Choose PDF (max 10MB)'}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) =>
                handleUpload(e.target.files?.[0], (url) => set({ url }), setUploadError, setUploading)
              }
            />
          </label>
          {uploadError && (
            <div className="mt-2">
              <Alert>{uploadError}</Alert>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className="space-y-4">
        <Input
          label="Image URL"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={content.url || ''}
          onChange={(e) => set({ url: e.target.value })}
        />
        <div>
          <p className="mb-1.5 text-sm font-medium text-text">Or upload an image</p>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-bg px-4 py-3 text-sm text-muted hover:border-primary hover:text-primary">
            <Upload size={16} />
            {uploading ? 'Uploading…' : 'Choose image (max 5MB)'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) =>
                handleUpload(e.target.files?.[0], (url) => set({ url }), setUploadError, setUploading)
              }
            />
          </label>
          {uploadError && (
            <div className="mt-2">
              <Alert>{uploadError}</Alert>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'social') {
    return (
      <div className="space-y-4">
        <Select
          label="Platform"
          value={content.platform || 'LinkedIn'}
          onChange={(e) => set({ platform: e.target.value })}
        >
          {['LinkedIn', 'Instagram', 'Twitter / X', 'Facebook', 'TikTok', 'Other'].map(
            (p) => (
              <option key={p} value={p}>
                {p}
              </option>
            )
          )}
        </Select>
        <Input
          label="Profile URL"
          type="url"
          placeholder="https://linkedin.com/in/you"
          value={content.url || ''}
          onChange={(e) => set({ url: e.target.value })}
        />
      </div>
    );
  }

  if (type === 'wifi') {
    return (
      <div className="space-y-4">
        <Input
          label="Network name (SSID)"
          value={content.ssid || ''}
          onChange={(e) => set({ ssid: e.target.value })}
          placeholder="My Wi-Fi"
        />
        <Select
          label="Security"
          value={content.security || 'WPA'}
          onChange={(e) => set({ security: e.target.value })}
        >
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="None">None</option>
        </Select>
        {content.security !== 'None' && (
          <Input
            label="Password"
            type="text"
            value={content.password || ''}
            onChange={(e) => set({ password: e.target.value })}
            placeholder="Network password"
          />
        )}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <Textarea
        label="Text"
        rows={5}
        value={content.text || ''}
        onChange={(e) => set({ text: e.target.value })}
        placeholder="Enter the text to encode…"
      />
    );
  }

  if (type === 'vcard') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full name"
          value={content.fullName || ''}
          onChange={(e) => set({ fullName: e.target.value })}
          className="sm:col-span-2"
        />
        <Input
          label="Company"
          value={content.company || ''}
          onChange={(e) => set({ company: e.target.value })}
        />
        <Input
          label="Job title"
          value={content.jobTitle || ''}
          onChange={(e) => set({ jobTitle: e.target.value })}
        />
        <Input
          label="Phone"
          value={content.phone || ''}
          onChange={(e) => set({ phone: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          value={content.email || ''}
          onChange={(e) => set({ email: e.target.value })}
        />
        <Input
          label="Website"
          type="url"
          value={content.website || ''}
          onChange={(e) => set({ website: e.target.value })}
          className="sm:col-span-2"
        />
        <Input
          label="Address"
          value={content.address || ''}
          onChange={(e) => set({ address: e.target.value })}
          className="sm:col-span-2"
        />
      </div>
    );
  }

  if (type === 'menu') {
    return (
      <div className="space-y-4">
        <Input
          label="Restaurant name"
          value={content.restaurantName || ''}
          onChange={(e) => set({ restaurantName: e.target.value })}
        />
        <Textarea
          label="Description"
          rows={3}
          value={content.description || ''}
          onChange={(e) => set({ description: e.target.value })}
        />
        <Input
          label="Menu URL"
          type="url"
          placeholder="https://example.com/menu"
          value={content.url || ''}
          onChange={(e) => set({ url: e.target.value })}
        />
      </div>
    );
  }

  return null;
}

export function defaultContent(type) {
  switch (type) {
    case 'vcard':
      return {
        fullName: '',
        company: '',
        jobTitle: '',
        phone: '',
        email: '',
        website: '',
        address: '',
      };
    case 'wifi':
      return { ssid: '', password: '', security: 'WPA' };
    case 'text':
      return { text: '' };
    case 'social':
      return { platform: 'LinkedIn', url: '' };
    case 'menu':
      return { restaurantName: '', description: '', url: '' };
    default:
      return { url: '' };
  }
}
