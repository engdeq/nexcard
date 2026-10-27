import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Pencil, Plus, QrCode, Search, Trash2 } from 'lucide-react';
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
} from '../components/ui';
import { QRPreview, downloadQrPng } from '../components/QRPreview';
import { api } from '../services/api';
import { QR_TYPE_META } from '../utils/qrContent';

export default function MyQRCodes() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const query = {};
      const s = params.search ?? search;
      const t = params.type ?? type;
      if (s) query.search = s;
      if (t) query.type = t;
      const res = await api.listQr(query);
      setItems(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ search: searchParams.get('search') || '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load({ search, type });
  };

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

  return (
    <div>
      <PageHeader
        title="My QR Codes"
        subtitle="Search, filter, download, edit, or delete your saved codes."
        actions={
          <Link to="/app/create">
            <Button size="sm">
              <Plus size={14} />
              Create QR Code
            </Button>
          </Link>
        }
      />

      <Card className="mb-4 !p-3.5">
        <form
          onSubmit={onSearch}
          className="flex flex-col gap-2.5 sm:flex-row sm:items-end"
        >
          <Input
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="flex-1"
          />
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="sm:w-44"
          >
            <option value="">All types</option>
            {QR_TYPE_META.map((t) => (
              <option key={t.type} value={t.type}>
                {t.title}
              </option>
            ))}
          </Select>
          <Button type="submit" size="sm">
            <Search size={14} />
            Filter
          </Button>
        </form>
      </Card>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-14">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={QrCode}
          title="No QR codes found"
          description="Create a QR code or adjust your search filters."
          action={
            <Link to="/app/create">
              <Button size="sm">
                <Plus size={14} />
                Create QR Code
              </Button>
            </Link>
          }
        />
      ) : (
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-border bg-bg/70 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Preview</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <QRPreview
                        payload={item.payload}
                        foregroundColor={item.customization?.foregroundColor}
                        backgroundColor={item.customization?.backgroundColor}
                        size={48}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[180px] truncate font-semibold text-text">
                        {item.title}
                      </p>
                      <p className="max-w-[220px] truncate text-xs text-muted">
                        {item.payload}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="blue">{item.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(item.createdAt).toLocaleString()}
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
                            downloadQrPng(item.payload, item.title, item.customization)
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
        This action cannot be undone. The QR code will be permanently removed.
      </Modal>
    </div>
  );
}
