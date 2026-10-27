import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Input,
  PageHeader,
  Spinner,
} from '../components/ui';
import { QRPreview, downloadQrPng, downloadQrSvg } from '../components/QRPreview';
import { QrTypeForm, defaultContent } from '../components/QrTypeForm';
import { api } from '../services/api';
import {
  QR_TYPE_META,
  buildQrPayload,
  validateQrForm,
} from '../utils/qrContent';

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

export default function CreateQR() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const typeParam = searchParams.get('type');
  const navigate = useNavigate();

  const [step, setStep] = useState(editId || typeParam ? 'workspace' : 'select');
  const [selectedType, setSelectedType] = useState(typeParam || 'website');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(defaultContent(typeParam || 'website'));
  const [foregroundColor, setForegroundColor] = useState('#172033');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [qrId, setQrId] = useState(editId || null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (editId || !typeParam) return;
    const meta = QR_TYPE_META.find((t) => t.type === typeParam);
    if (!meta) return;
    setSelectedType(typeParam);
    setContent(defaultContent(typeParam));
    setTitle(meta.title);
    setStep('workspace');
  }, [typeParam, editId]);

  useEffect(() => {
    if (!editId) return undefined;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.getQr(editId);
        if (cancelled) return;
        const item = res.data;
        setSelectedType(item.type);
        setTitle(item.title);
        setContent(item.content || defaultContent(item.type));
        setForegroundColor(item.customization?.foregroundColor || '#111827');
        setBackgroundColor(item.customization?.backgroundColor || '#FFFFFF');
        setQrId(item._id);
        setGenerated(true);
        setStep('workspace');
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
  }, [editId]);

  const payload = useMemo(() => {
    if (!generated) return '';
    const validation = validateQrForm(selectedType, content);
    if (validation) return '';
    return buildQrPayload(selectedType, content);
  }, [generated, selectedType, content]);

  const selectType = (type) => {
    setSelectedType(type);
    setContent(defaultContent(type));
    setGenerated(false);
    setError('');
    setSuccess('');
    if (!title) {
      const meta = QR_TYPE_META.find((t) => t.type === type);
      setTitle(meta?.title || 'My QR Code');
    }
    setStep('workspace');
  };

  const handleGenerate = () => {
    setError('');
    setSuccess('');
    const validation = validateQrForm(selectedType, content);
    if (validation) {
      setError(validation);
      setGenerated(false);
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title for this QR code');
      return;
    }
    setGenerated(true);
    setSuccess('QR code generated');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    const validation = validateQrForm(selectedType, content);
    if (validation) {
      setError(validation);
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        type: selectedType,
        content,
        customization: { foregroundColor, backgroundColor },
      };
      const res = qrId
        ? await api.updateQr(qrId, body)
        : await api.createQr(body);
      setQrId(res.data._id);
      setGenerated(true);
      setSuccess(qrId ? 'QR code updated' : 'QR code saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setContent(defaultContent(selectedType));
    setTitle('');
    setForegroundColor('#111827');
    setBackgroundColor('#FFFFFF');
    setGenerated(false);
    setError('');
    setSuccess('');
    setQrId(null);
    navigate('/app/create', { replace: true });
  };

  const handleCopy = async () => {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    setSuccess('Content copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={editId ? 'Edit QR Code' : 'Create QR Code'}
        subtitle="Choose a content type, fill in the details, then generate and save."
        actions={
          step === 'workspace' ? (
            <Button variant="secondary" onClick={() => setStep('select')}>
              Change type
            </Button>
          ) : null
        }
      />

      {step === 'select' && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {QR_TYPE_META.map((item, index) => {
            const Icon = ICON_MAP[item.icon] || Icons.QrCode;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => selectType(item.type)}
                className="hover-lift rounded-2xl border border-border bg-card p-3.5 text-left card-shadow"
              >
                <div
                  className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl ${TYPE_COLORS[index % TYPE_COLORS.length]}`}
                >
                  <Icon size={16} />
                </div>
                <h3 className="text-[13px] font-semibold text-text">{item.title}</h3>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {step === 'workspace' && (
        <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Card>
              <div className="mb-3 flex items-center gap-3">
                {(() => {
                  const meta = QR_TYPE_META.find((t) => t.type === selectedType);
                  const Icon = ICON_MAP[meta?.icon] || Icons.QrCode;
                  const idx = QR_TYPE_META.findIndex((t) => t.type === selectedType);
                  return (
                    <>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${TYPE_COLORS[idx % TYPE_COLORS.length]}`}
                      >
                        <Icon size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text">{meta?.title}</p>
                        <p className="text-xs text-muted">{meta?.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="space-y-3">
                <Input
                  label="QR code title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Company website"
                />
                <QrTypeForm
                  type={selectedType}
                  content={content}
                  onChange={setContent}
                />
              </div>
            </Card>

            <Card>
              <h3 className="mb-3 font-display text-sm font-bold text-text">
                Customization
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium">QR color</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card p-1"
                    />
                    <span className="text-sm text-muted">{foregroundColor}</span>
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium">
                    Background color
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card p-1"
                    />
                    <span className="text-sm text-muted">{backgroundColor}</span>
                  </div>
                </label>
              </div>
            </Card>

            {(error || success) && (
              <Alert type={success ? 'success' : 'error'}>
                {error || success}
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerate}>
                <Icons.Sparkles size={15} />
                Generate
              </Button>
              <Button variant="secondary" onClick={handleSave} loading={saving}>
                <Icons.Save size={15} />
                Save
              </Button>
              <Button
                variant="secondary"
                disabled={!payload}
                onClick={() =>
                  downloadQrPng(payload, title || 'nexacard-qr', {
                    foregroundColor,
                    backgroundColor,
                  })
                }
              >
                <Icons.Download size={15} />
                PNG
              </Button>
              <Button
                variant="secondary"
                disabled={!payload}
                onClick={() =>
                  downloadQrSvg(payload, title || 'nexacard-qr', {
                    foregroundColor,
                    backgroundColor,
                  })
                }
              >
                <Icons.FileCode size={15} />
                SVG
              </Button>
              <Button variant="ghost" disabled={!payload} onClick={handleCopy}>
                <Icons.Copy size={15} />
                Copy
              </Button>
              <Button variant="ghost" onClick={handleClear}>
                <Icons.Eraser size={15} />
                Clear
              </Button>
            </div>
          </div>

          <div className="xl:sticky xl:top-20 xl:self-start">
            <Card className="flex flex-col items-center text-center">
              <p className="mb-1 text-sm font-medium text-muted">Live preview</p>
              <p className="mb-3 text-xs capitalize text-muted">{selectedType}</p>
              <QRPreview
                payload={payload}
                foregroundColor={foregroundColor}
                backgroundColor={backgroundColor}
                size={220}
              />
              {title && (
                <p className="mt-3 max-w-[220px] truncate text-sm font-semibold text-text">
                  {title}
                </p>
              )}
              {payload && (
                <p className="mt-2 line-clamp-3 max-w-[240px] break-all text-[11px] text-muted">
                  {payload}
                </p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
