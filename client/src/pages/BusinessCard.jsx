import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Check,
  Copy,
  Download,
  Eye,
  Globe,
  ImagePlus,
  Link2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Rocket,
  Save,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Select,
  Spinner,
} from '../components/ui';
import { PhonePreview } from '../components/PhonePreview';
import { QRPreview, downloadQrPng } from '../components/QRPreview';
import {
  SOCIAL_PLATFORMS,
  SocialBrandIcon,
  socialBrandColor,
} from '../components/SocialIcons';
import { api, assetUrl } from '../services/api';

const ACCENT_SWATCHES = [
  '#3478F6',
  '#7657F6',
  '#16B879',
  '#F59E0B',
  '#EF4444',
  '#0EA5E9',
  '#EC4899',
  '#172033',
];

const emptyProfile = {
  fullName: '',
  jobTitle: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  bio: '',
  profilePhoto: '',
  coverImage: '',
  companyLogo: '',
  accentColor: '#3478F6',
  buttonStyle: 'solid',
  socialLinks: [
    { platform: 'LinkedIn', url: '' },
    { platform: 'Instagram', url: '' },
  ],
  isPublished: false,
  slug: '',
};

function FieldLabel({ children, icon: Icon }) {
  return (
    <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-text">
      {Icon && <Icon size={13} className="text-muted" />}
      {children}
    </span>
  );
}

export default function BusinessCard() {
  const [profile, setProfile] = useState(emptyProfile);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const fileRefs = useRef({});

  const serialize = (p) =>
    JSON.stringify({
      ...p,
      socialLinks: (p.socialLinks || []).map((s) => ({
        platform: s.platform,
        url: s.url,
      })),
    });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.listProfiles();
        if (cancelled) return;
        if (res.data?.length) {
          const p = res.data[0];
          const next = {
            fullName: p.fullName || '',
            jobTitle: p.jobTitle || '',
            company: p.company || '',
            phone: p.phone || '',
            email: p.email || '',
            website: p.website || '',
            address: p.address || '',
            bio: p.bio || '',
            profilePhoto: p.profilePhoto || '',
            coverImage: p.coverImage || '',
            companyLogo: p.companyLogo || '',
            accentColor: p.accentColor || '#3478F6',
            buttonStyle: p.buttonStyle || 'solid',
            socialLinks: p.socialLinks?.length
              ? p.socialLinks
              : emptyProfile.socialLinks,
            isPublished: !!p.isPublished,
            slug: p.slug || '',
          };
          setProfileId(p._id);
          setProfile(next);
          setSavedSnapshot(serialize(next));
          setUpdatedAt(p.updatedAt);
        } else {
          setSavedSnapshot(serialize(emptyProfile));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isDirty = useMemo(
    () => savedSnapshot && serialize(profile) !== savedSnapshot,
    [profile, savedSnapshot]
  );

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const setField = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSuccess('');
  };

  const setSocial = (index, patch) => {
    setProfile((prev) => {
      const links = [...(prev.socialLinks || [])];
      links[index] = { ...links[index], ...patch };
      return { ...prev, socialLinks: links };
    });
    setSuccess('');
  };

  const removeSocial = (index) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const addSocial = (platform = 'Custom URL') => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { platform, url: '' }],
    }));
  };

  const validateImage = (file) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!ok) throw new Error('Use JPG, PNG, or WebP images only');
    if (file.size > 5 * 1024 * 1024) throw new Error('Image must be under 5MB');
  };

  const onUpload = async (file, field) => {
    if (!file) return;
    setUploading(field);
    setError('');
    try {
      validateImage(file);
      const res = await api.upload(file);
      setField(field, res.data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading('');
    }
  };

  const publicUrl = profile.slug
    ? `${window.location.origin}/p/${profile.slug}`
    : '';
  const canShare = !!(profile.slug && profile.isPublished);

  const copyLink = async () => {
    if (!canShare) {
      setError('Publish your profile before sharing the public link');
      return;
    }
    await navigator.clipboard.writeText(publicUrl);
    setSuccess('Public link copied');
  };

  const save = async (publish) => {
    setError('');
    setSuccess('');
    if (!profile.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...profile,
        isPublished: publish ?? profile.isPublished,
        socialLinks: (profile.socialLinks || []).filter((s) => s.url?.trim()),
      };
      const res = profileId
        ? await api.updateProfileCard(profileId, body)
        : await api.createProfile(body);
      const saved = {
        ...profile,
        slug: res.data.slug,
        isPublished: res.data.isPublished,
        profilePhoto: res.data.profilePhoto || '',
        coverImage: res.data.coverImage || '',
        companyLogo: res.data.companyLogo || '',
        accentColor: res.data.accentColor || profile.accentColor,
        buttonStyle: res.data.buttonStyle || profile.buttonStyle,
        socialLinks: res.data.socialLinks?.length
          ? res.data.socialLinks
          : profile.socialLinks,
      };
      setProfileId(res.data._id);
      setProfile(saved);
      setSavedSnapshot(serialize(saved));
      setUpdatedAt(res.data.updatedAt);
      setSuccess(
        res.data.isPublished
          ? `Published at /p/${res.data.slug}`
          : 'All changes saved'
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    if (!savedSnapshot) return;
    setProfile(JSON.parse(savedSnapshot));
    setError('');
    setSuccess('Changes reset');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-text sm:text-2xl">
            Business Card Profile
          </h1>
          <p className="mt-1 text-sm text-muted">
            Create your professional digital identity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={!canShare}
            onClick={() =>
              canShare
                ? window.open(`/p/${profile.slug}`, '_blank')
                : setError('Publish your profile to preview the public page')
            }
          >
            <Eye size={14} />
            Preview Profile
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={saving}
            onClick={() => save(profile.isPublished)}
          >
            <Save size={14} />
            Save Changes
          </Button>
          <Button size="sm" loading={saving} onClick={() => save(true)}>
            <Rocket size={14} />
            {profile.isPublished ? 'Update Profile' : 'Publish Profile'}
          </Button>
        </div>
      </div>

      {(error || success) && (
        <div className="mb-4">
          <Alert type={success ? 'success' : 'error'}>{error || success}</Alert>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        {/* LEFT — Editor */}
        <div className="space-y-4">
          {/* Profile & Branding media */}
          <Card className="!p-0 overflow-hidden">
            <div className="relative h-36 bg-gradient-to-br from-primary to-secondary sm:h-44">
              {profile.coverImage ? (
                <img
                  src={assetUrl(profile.coverImage)}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/70">
                  <ImagePlus size={28} />
                </div>
              )}
              <div className="absolute bottom-3 right-3 flex gap-2">
                <label className="cursor-pointer rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-text shadow-sm hover:bg-white">
                  {uploading === 'coverImage' ? 'Uploading…' : 'Change Cover'}
                  <input
                    ref={(el) => (fileRefs.current.cover = el)}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => onUpload(e.target.files?.[0], 'coverImage')}
                  />
                </label>
                {profile.coverImage && (
                  <button
                    type="button"
                    className="rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-danger shadow-sm"
                    onClick={() => setField('coverImage', '')}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 px-4 pb-4 pt-0 sm:flex-row sm:items-end sm:px-5">
              <div className="-mt-10 relative shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-bg shadow-md">
                  {profile.profilePhoto ? (
                    <img
                      src={assetUrl(profile.profilePhoto)}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted">
                      <User size={32} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-wrap items-center gap-2 sm:pb-1">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-bg">
                  <Upload size={13} />
                  {uploading === 'profilePhoto'
                    ? 'Uploading…'
                    : profile.profilePhoto
                      ? 'Change Photo'
                      : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      onUpload(e.target.files?.[0], 'profilePhoto')
                    }
                  />
                </label>
                {profile.profilePhoto && (
                  <button
                    type="button"
                    className="text-xs font-medium text-danger"
                    onClick={() => setField('profilePhoto', '')}
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-bg px-3 py-2.5 sm:ml-auto">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
                  {profile.companyLogo ? (
                    <img
                      src={assetUrl(profile.companyLogo)}
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 size={18} className="text-muted" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text">Company Logo</p>
                  <label className="mt-1 inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-primary">
                    <Upload size={11} />
                    {uploading === 'companyLogo' ? 'Uploading…' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        onUpload(e.target.files?.[0], 'companyLogo')
                      }
                    />
                  </label>
                  {profile.companyLogo && (
                    <button
                      type="button"
                      className="ml-2 text-[11px] text-danger"
                      onClick={() => setField('companyLogo', '')}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="border-t border-border px-4 py-2 text-[11px] text-muted sm:px-5">
              JPG, PNG, or WebP · max 5MB each. Profile photo and company logo
              are stored separately.
            </p>
          </Card>

          {/* Personal */}
          <Card>
            <h3 className="mb-3 font-display text-sm font-bold text-text">
              Personal Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <FieldLabel icon={User}>Full Name</FieldLabel>
                <input
                  value={profile.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  placeholder="e.g. Jane Cooper"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="block">
                <FieldLabel>Professional Title</FieldLabel>
                <input
                  value={profile.jobTitle}
                  onChange={(e) => setField('jobTitle', e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="block">
                <FieldLabel icon={Building2}>Company Name</FieldLabel>
                <input
                  value={profile.company}
                  onChange={(e) => setField('company', e.target.value)}
                  placeholder="e.g. NexaCard"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="block sm:col-span-2">
                <FieldLabel>Short Biography</FieldLabel>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setField('bio', e.target.value)}
                  placeholder="A short introduction about you or your business"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
            </div>
          </Card>

          {/* Contact */}
          <Card>
            <h3 className="mb-3 font-display text-sm font-bold text-text">
              Contact Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <FieldLabel icon={Phone}>Phone Number</FieldLabel>
                <input
                  value={profile.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="+251 9XX XXX XXX"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="block">
                <FieldLabel icon={Mail}>Email Address</FieldLabel>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="block">
                <FieldLabel icon={Globe}>Website URL</FieldLabel>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setField('website', e.target.value)}
                  placeholder="https://company.com"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="block">
                <FieldLabel icon={MapPin}>Business Address</FieldLabel>
                <input
                  value={profile.address}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="City, Country"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
            </div>
          </Card>

          {/* Social — all visible, no hidden menus */}
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-text">
                Social Media Links
              </h3>
              <Button variant="soft" size="sm" onClick={() => addSocial()}>
                <Plus size={13} />
                Add Social Link
              </Button>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {SOCIAL_PLATFORMS.filter((p) => p !== 'Custom URL').map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => addSocial(p)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-1 text-[11px] font-semibold text-text hover:border-primary hover:bg-primary/5"
                  style={{ color: socialBrandColor(p) }}
                >
                  <SocialBrandIcon platform={p} size={12} />
                  {p}
                </button>
              ))}
            </div>
            <div className="space-y-2.5">
              {(profile.socialLinks || []).map((link, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-bg/50 p-2.5 sm:flex-row sm:items-center"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card"
                    style={{ color: socialBrandColor(link.platform) }}
                  >
                    <SocialBrandIcon platform={link.platform} size={16} />
                  </span>
                  <Select
                    value={link.platform}
                    onChange={(e) =>
                      setSocial(index, { platform: e.target.value })
                    }
                    className="sm:w-40"
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="url"
                    value={link.url}
                    onChange={(e) => setSocial(index, { url: e.target.value })}
                    className="min-w-0 flex-1"
                    placeholder={`https://${(link.platform || 'social').toLowerCase().replace(/\s+/g, '')}.com/you`}
                  />
                  <button
                    type="button"
                    className="rounded-xl border border-border p-2.5 text-muted hover:border-danger hover:text-danger sm:shrink-0"
                    onClick={() => removeSocial(index)}
                    aria-label="Remove social link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(profile.socialLinks || []).length === 0 && (
                <p className="text-sm text-muted">
                  No social links yet. Click Add Social Link or a platform chip
                  above.
                </p>
              )}
            </div>
          </Card>

          {/* Design options — always visible */}
          <Card>
            <h3 className="mb-3 font-display text-sm font-bold text-text">
              Profile Design
            </h3>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[13px] font-medium text-text">
                  Accent Color
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {ACCENT_SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setField('accentColor', color)}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        profile.accentColor === color
                          ? 'border-text scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Accent ${color}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={profile.accentColor}
                    onChange={(e) => setField('accentColor', e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded-lg border border-border bg-card p-0.5"
                    title="Custom color"
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-[13px] font-medium text-text">
                  Button Style
                </p>
                <div className="inline-flex rounded-xl border border-border bg-bg p-1">
                  {['solid', 'outline', 'rounded'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setField('buttonStyle', style)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                        profile.buttonStyle === style
                          ? 'bg-primary text-white'
                          : 'text-muted hover:text-text'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT — Preview + status + QR */}
        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card className="!p-4">
            <p className="mb-3 text-sm font-semibold text-text">Live Preview</p>
            <PhonePreview profile={profile} />
          </Card>

          <Card className="!p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-text">Profile Status</p>
              <Badge tone={profile.isPublished ? 'success' : 'warning'}>
                {profile.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            {profile.slug ? (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2">
                <Link2 size={14} className="shrink-0 text-muted" />
                <code className="min-w-0 flex-1 truncate text-xs text-text">
                  {publicUrl}
                </code>
                <button
                  type="button"
                  onClick={copyLink}
                  className="shrink-0 text-muted hover:text-primary"
                  title="Copy link"
                >
                  <Copy size={14} />
                </button>
              </div>
            ) : (
              <p className="mb-3 text-xs text-muted">
                Save or publish to generate your public URL.
              </p>
            )}
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                className="w-full"
                disabled={!canShare}
                onClick={() => window.open(`/p/${profile.slug}`, '_blank')}
              >
                <Eye size={14} />
                Open Profile
              </Button>
              {profile.isPublished ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  loading={saving}
                  onClick={() => save(false)}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  loading={saving}
                  onClick={() => save(true)}
                >
                  <Rocket size={14} />
                  Publish Profile
                </Button>
              )}
            </div>
          </Card>

          <Card className="!p-4">
            <p className="mb-3 text-sm font-semibold text-text">Profile QR Code</p>
            {canShare ? (
              <>
                <div className="flex justify-center">
                  <QRPreview
                    payload={publicUrl}
                    foregroundColor={profile.accentColor}
                    size={160}
                  />
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() =>
                      downloadQrPng(publicUrl, profile.slug || 'profile', {
                        foregroundColor: profile.accentColor,
                      })
                    }
                  >
                    <Download size={14} />
                    Download QR Code
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    onClick={copyLink}
                  >
                    <Copy size={14} />
                    Copy Profile Link
                  </Button>
                </div>
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-bg px-3 py-6 text-center text-xs text-muted">
                Publish your profile to generate a shareable QR code linked to
                your public page.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-3 z-20 mt-6 overflow-hidden rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted">
            {isDirty ? (
              <span className="font-medium text-warning">Unsaved changes</span>
            ) : (
              <>
                <Check size={14} className="text-success" />
                <span className="font-medium text-success">All changes saved</span>
              </>
            )}
            {updatedAt && (
              <span className="hidden sm:inline">
                · Last updated {new Date(updatedAt).toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={!isDirty}
              onClick={resetChanges}
            >
              Reset Changes
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!canShare}
              onClick={() => window.open(`/p/${profile.slug}`, '_blank')}
            >
              <Eye size={14} />
              Preview
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={saving}
              onClick={() => save(profile.isPublished)}
            >
              <Save size={14} />
              Save
            </Button>
            <Button size="sm" loading={saving} onClick={() => save(true)}>
              <Rocket size={14} />
              Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
