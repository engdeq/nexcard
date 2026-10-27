import { useEffect, useState } from 'react';
import {
  Megaphone,
  Pencil,
  Plus,
  Power,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from '../components/ui';
import { api, assetUrl } from '../services/api';

const PLACEMENTS = [
  { value: 'hero', label: 'Main hero banner' },
  { value: 'dashboard', label: 'Dashboard promotional banner' },
  { value: 'qr_create', label: 'QR creation promotional card' },
  { value: 'business_card', label: 'Business Card promotional section' },
  { value: 'public_website', label: 'Public website promotional banner' },
];

const FALLBACK_BANNERS = [
  {
    title: 'Make Your Restaurant Menu Digital',
    description: 'Let customers scan and explore your menu instantly.',
    tone: 'from-orange-400 to-amber-500',
    cta: 'Create Menu QR',
    to: '/app/create?type=menu',
  },
  {
    title: 'Share Your Business in One Scan',
    description: 'Create a beautiful digital identity for your business.',
    tone: 'from-primary to-secondary',
    cta: 'Edit Business Card',
    to: '/app/business-card',
  },
  {
    title: 'Make Your QR Code Stand Out',
    description: 'Use your brand colors and professional designs.',
    tone: 'from-secondary to-indigo-500',
    cta: 'Create QR Code',
    to: '/app/create',
  },
];

const emptyForm = {
  title: '',
  description: '',
  imageUrl: '',
  destinationUrl: '',
  placement: 'dashboard',
  startDate: '',
  endDate: '',
  isActive: true,
};

export default function WebsiteAds() {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.listAds();
      setAds(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await api.upload(file);
      setField('imageUrl', res.data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const onEdit = (ad) => {
    setEditId(ad._id);
    setForm({
      title: ad.title,
      description: ad.description || '',
      imageUrl: ad.imageUrl,
      destinationUrl: ad.destinationUrl || '',
      placement: ad.placement,
      startDate: ad.startDate ? ad.startDate.slice(0, 10) : '',
      endDate: ad.endDate ? ad.endDate.slice(0, 10) : '',
      isActive: ad.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.title.trim() || !form.imageUrl) {
      setError('Title and banner image are required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editId) await api.updateAd(editId, body);
      else await api.createAd(body);
      setSuccess(editId ? 'Advertisement updated' : 'Advertisement saved');
      resetForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad) => {
    try {
      await api.updateAd(ad._id, { isActive: !ad.isActive });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteAd(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const placementLabel = (value) =>
    PLACEMENTS.find((p) => p.value === value)?.label || value;

  return (
    <div>
      <PageHeader
        title="Website & Ads"
        subtitle="Manage promotional banners shown across NexaCard. Inactive or expired ads are hidden automatically."
      />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {FALLBACK_BANNERS.map((banner) => (
          <Card
            key={banner.title}
            padding={false}
            className="overflow-hidden"
          >
            <div className={`h-24 bg-gradient-to-br ${banner.tone}`} />
            <div className="p-3.5">
              <p className="font-display text-sm font-bold text-text">
                {banner.title}
              </p>
              <p className="mt-1 text-xs text-muted">{banner.description}</p>
              <a
                href={banner.to}
                className="mt-2 inline-block text-xs font-bold text-primary"
              >
                {banner.cta} →
              </a>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card>
          <h3 className="mb-3 font-display text-sm font-bold text-text">
            {editId ? 'Edit Advertisement' : 'Create Advertisement'}
          </h3>
          <form onSubmit={onSave} className="space-y-3">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              required
            />
            <Textarea
              label="Short description"
              rows={2}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-text">
                Banner image
              </p>
              {form.imageUrl && (
                <img
                  src={assetUrl(form.imageUrl)}
                  alt="Banner preview"
                  className="mb-2 h-28 w-full rounded-xl object-cover"
                />
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-bg">
                <Upload size={13} />
                {uploading ? 'Uploading…' : 'Upload image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files?.[0])}
                />
              </label>
            </div>
            <Input
              label="Destination URL"
              type="url"
              value={form.destinationUrl}
              onChange={(e) => setField('destinationUrl', e.target.value)}
              placeholder="https://"
            />
            <Select
              label="Placement"
              value={form.placement}
              onChange={(e) => setField('placement', e.target.value)}
            >
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Start date"
                type="date"
                value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)}
              />
              <Input
                label="End date"
                type="date"
                value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setField('isActive', e.target.checked)}
              />
              Active
            </label>

            {(error || success) && (
              <Alert type={success ? 'success' : 'error'}>
                {error || success}
              </Alert>
            )}

            <div className="flex gap-2">
              <Button type="submit" loading={saving}>
                <Plus size={14} />
                {editId ? 'Update' : 'Save Advertisement'}
              </Button>
              {editId && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div>
          <h3 className="mb-3 font-display text-sm font-bold text-text">
            Saved Advertisements
          </h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : ads.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No advertisements yet"
              description="Create your first banner using the form. Static promo cards above remain available as fallbacks."
            />
          ) : (
            <div className="space-y-3">
              {ads.map((ad) => (
                <Card key={ad._id} className="!p-3.5">
                  <div className="flex gap-3">
                    <img
                      src={assetUrl(ad.imageUrl)}
                      alt={ad.title}
                      className="h-16 w-24 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-text">{ad.title}</p>
                        <Badge tone={ad.isActive ? 'success' : 'warning'}>
                          {ad.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {placementLabel(ad.placement)}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {ad.startDate
                          ? new Date(ad.startDate).toLocaleDateString()
                          : 'No start'}{' '}
                        →{' '}
                        {ad.endDate
                          ? new Date(ad.endDate).toLocaleDateString()
                          : 'No end'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onEdit(ad)}>
                          <Pencil size={13} />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleActive(ad)}
                        >
                          <Power size={13} />
                          {ad.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger"
                          onClick={() => setDeleteId(ad._id)}
                        >
                          <Trash2 size={13} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={!!deleteId}
        title="Delete advertisement?"
        onClose={() => setDeleteId(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        This advertisement will be permanently removed.
      </Modal>
    </div>
  );
}
