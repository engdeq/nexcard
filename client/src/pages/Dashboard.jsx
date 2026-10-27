import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Contact,
  Download,
  Eye,
  Link2,
  Pencil,
  Plus,
  QrCode,
  Trash2,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  SectionTitle,
  Spinner,
} from '../components/ui';
import { QRPreview, downloadQrPng } from '../components/QRPreview';
import { PhonePreview } from '../components/PhonePreview';
import { api, assetUrl } from '../services/api';
import { QR_TYPE_META } from '../utils/qrContent';

const ICON_MAP = {
  Globe: Icons.Globe,
  Contact: Icons.Contact,
  FileText: Icons.FileText,
  Image: Icons.Image,
  Share2: Icons.Share2,
  Wifi: Icons.Wifi,
  Type: Icons.Type,
  Briefcase: Icons.Briefcase,
  Smartphone: Icons.Smartphone,
  UtensilsCrossed: Icons.UtensilsCrossed,
};

const TYPE_COLORS = [
  'bg-primary/10 text-primary',
  'bg-secondary/10 text-secondary',
  'bg-orange-500/10 text-orange-500',
  'bg-emerald-500/10 text-emerald-600',
  'bg-pink-500/10 text-pink-500',
  'bg-cyan-500/10 text-cyan-600',
  'bg-amber-500/10 text-amber-600',
  'bg-indigo-500/10 text-indigo-500',
  'bg-rose-500/10 text-rose-500',
  'bg-teal-500/10 text-teal-600',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrStats, setQrStats] = useState({ totalQr: 0, recent: [] });
  const [profileStats, setProfileStats] = useState({ total: 0, published: 0 });
  const [profile, setProfile] = useState(null);
  const [promoAd, setPromoAd] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [qr, profiles, myProfiles, ads] = await Promise.all([
        api.getQrStats(),
        api.getProfileStats(),
        api.listProfiles(),
        api.listActiveAds({ placement: 'dashboard' }).catch(() => ({ data: [] })),
      ]);
      setQrStats(qr.data);
      setProfileStats(profiles.data);
      setProfile(myProfiles.data?.[0] || null);
      setPromoAd(ads.data?.[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteQr(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total QR Codes',
      value: qrStats.totalQr,
      icon: QrCode,
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: 'Digital Business Cards',
      value: profileStats.total,
      icon: Contact,
      tone: 'bg-secondary/10 text-secondary',
    },
    {
      label: 'Profile Views',
      value: '—',
      icon: Eye,
      tone: 'bg-orange-500/10 text-orange-500',
      note: 'Not tracked yet',
    },
    {
      label: 'Active Links',
      value: profileStats.published,
      icon: Link2,
      tone: 'bg-success/10 text-success',
      note: 'Published profiles',
    },
  ];

  return (
    <div className="space-y-5">
      {error && <Alert>{error}</Alert>}

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#4f6ef7] to-secondary px-5 py-5 text-white sm:px-6 sm:py-6 lg:min-h-[250px]">
            <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 right-1/3 h-28 w-28 rounded-full bg-white/10 blur-xl" />

            <div className="relative grid items-center gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <span className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur">
                  Create • Share • Connect
                </span>
                <h1 className="font-display mt-3 max-w-lg text-2xl font-extrabold leading-tight sm:text-3xl">
                  Digital Business Cards That Make an Impression
                </h1>
                <p className="mt-2 max-w-md text-sm text-white/85">
                  Generate QR codes, create beautiful digital profiles, and share
                  your business in seconds.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/app/create">
                    <Button variant="white" size="md">
                      <Plus size={15} />
                      Create QR Code
                    </Button>
                  </Link>
                  <Link to="/app/business-card">
                    <Button
                      size="md"
                      className="border border-white/30 bg-transparent text-white hover:bg-white/10"
                    >
                      Explore Business Cards
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto hidden w-full max-w-[220px] lg:block">
                <div className="rounded-[1.6rem] border-[6px] border-white/20 bg-white/10 p-1.5 backdrop-blur">
                  <div className="overflow-hidden rounded-[1.2rem] bg-white text-text">
                    <div className="h-16 bg-gradient-to-r from-primary to-secondary" />
                    <div className="-mt-6 px-3 pb-3">
                      <div className="mx-auto mb-2 h-12 w-12 rounded-full border-2 border-white bg-bg" />
                      <p className="text-center text-xs font-bold">Your Profile</p>
                      <p className="text-center text-[10px] text-muted">
                        Digital business card
                      </p>
                      <div className="mt-2 flex justify-center">
                        <div className="rounded-lg border border-border bg-white p-1">
                          <QRPreview
                            payload={
                              profile?.slug
                                ? `${window.location.origin}/p/${profile.slug}`
                                : 'https://nexacard.app'
                            }
                            size={64}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-center text-[11px] font-medium text-white/80">
                  Scan to view my profile
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="!p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted">{item.label}</p>
                      <p className="mt-1 font-display text-2xl font-bold text-text">
                        {item.value}
                      </p>
                      {item.note && (
                        <p className="mt-1 text-[11px] text-muted">{item.note}</p>
                      )}
                    </div>
                    <div className={`rounded-xl p-2 ${item.tone}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* QR type grid */}
          <section>
            <SectionTitle
              title="Create Your QR Code"
              subtitle="Choose a type to get started."
            />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {QR_TYPE_META.map((item, index) => {
                const Icon = ICON_MAP[item.icon] || QrCode;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => navigate(`/app/create?type=${item.type}`)}
                    className="hover-lift rounded-2xl border border-border bg-card p-3 text-left card-shadow"
                  >
                    <div
                      className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl ${TYPE_COLORS[index % TYPE_COLORS.length]}`}
                    >
                      <Icon size={16} />
                    </div>
                    <p className="text-[13px] font-semibold text-text">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Recently created */}
          <section>
            <SectionTitle
              title="Recently Created"
              subtitle="Your latest QR codes"
              action={
                <Link to="/app/qr-codes" className="text-sm font-semibold text-primary">
                  View all
                </Link>
              }
            />

            {qrStats.recent?.length === 0 ? (
              <EmptyState
                icon={QrCode}
                title="No QR codes yet"
                description="Create your first QR code to share a website, Wi-Fi, or digital card."
                action={
                  <Link to="/app/create">
                    <Button>
                      <Plus size={15} />
                      Create QR Code
                    </Button>
                  </Link>
                }
              />
            ) : (
              <Card padding={false} className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-b border-border bg-bg/70 text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-4 py-3 font-semibold">QR</th>
                        <th className="px-4 py-3 font-semibold">Title</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Created</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qrStats.recent.map((item) => (
                        <tr key={item._id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">
                            <QRPreview
                              payload={item.payload}
                              foregroundColor={item.customization?.foregroundColor}
                              backgroundColor={item.customization?.backgroundColor}
                              size={44}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="max-w-[160px] truncate font-semibold text-text">
                              {item.title}
                            </p>
                            <p className="max-w-[180px] truncate text-xs text-muted">
                              {item.payload}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone="blue">{item.type}</Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone="success">Active</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Link
                                to={`/app/create?id=${item._id}`}
                                className="rounded-lg p-1.5 text-muted hover:bg-bg hover:text-primary"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </Link>
                              <button
                                type="button"
                                className="rounded-lg p-1.5 text-muted hover:bg-bg hover:text-primary"
                                title="Download"
                                onClick={() =>
                                  downloadQrPng(
                                    item.payload,
                                    item.title,
                                    item.customization
                                  )
                                }
                              >
                                <Download size={14} />
                              </button>
                              <button
                                type="button"
                                className="rounded-lg p-1.5 text-muted hover:bg-bg hover:text-danger"
                                title="Delete"
                                onClick={() => setDeleteId(item._id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </section>
        </div>

        {/* Right column */}
        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card padding={false} className="overflow-hidden">
            {promoAd ? (
              <div>
                <img
                  src={assetUrl(promoAd.imageUrl)}
                  alt={promoAd.title}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4">
                  <p className="font-display text-sm font-bold text-text">
                    {promoAd.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">{promoAd.description}</p>
                  {promoAd.destinationUrl && (
                    <a
                      href={promoAd.destinationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-xs font-bold text-primary"
                    >
                      Learn more →
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#fff7ed] to-[#ffe8d6] p-4 dark:from-orange-500/10 dark:to-orange-500/5">
                <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-gradient-to-t from-orange-400/25 to-orange-200/20">
                  <Icons.UtensilsCrossed size={36} className="text-orange-500" />
                </div>
                <p className="font-display text-sm font-bold text-text">
                  Make Your Restaurant Menu Digital
                </p>
                <p className="mt-1 text-xs text-muted">
                  Let customers scan and explore your menu instantly.
                </p>
                <Link to="/app/create?type=menu" className="mt-3 inline-block">
                  <Button size="sm">Create Menu QR →</Button>
                </Link>
              </div>
            )}
          </Card>

          <Card>
            <p className="mb-3 text-sm font-semibold text-text">Live Preview</p>
            <PhonePreview
              profile={
                profile || {
                  fullName: 'Jane Cooper',
                  jobTitle: 'Product Designer',
                  company: 'NexaCard',
                  phone: '',
                  email: '',
                  website: '',
                  bio: 'Create your digital business card to see a live preview here.',
                  socialLinks: [],
                }
              }
              compact
            />
            <Link to="/app/business-card" className="mt-3 block">
              <Button variant="secondary" className="w-full" size="sm">
                Edit Business Card
              </Button>
            </Link>
          </Card>

          <Card className="!p-4">
            <p className="font-display text-sm font-bold text-text">Need Help?</p>
            <p className="mt-1 text-xs text-muted">
              Visit Settings for account help, or open Create QR Code to start
              sharing.
            </p>
            <Link to="/app/settings" className="mt-3 inline-block">
              <Button size="sm" variant="soft">
                Open Settings →
              </Button>
            </Link>
          </Card>
        </aside>
      </div>

      <Modal
        open={!!deleteId}
        title="Delete QR code?"
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
        This action cannot be undone.
      </Modal>
    </div>
  );
}
