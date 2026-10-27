import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Spinner } from '../components/ui';
import { Logo } from '../components/Logo';
import { SiteFooter } from '../components/SiteFooter';
import { DigitalCard } from '../components/DigitalCard';
import { api } from '../services/api';

export default function PublicProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.getPublicProfile(slug);
        if (!cancelled) setProfile(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Profile not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const downloadVcard = () => {
    window.location.href = `/api/public/profiles/${slug}/vcard`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4">
        <Logo showTagline />
        <div className="mt-8 w-full max-w-md">
          <Alert>{error || 'Profile not found'}</Alert>
        </div>
        <Link to="/" className="mt-6 text-sm font-medium text-primary">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FC]">
      <div className="mx-auto max-w-md px-3 py-6 sm:px-4">
        <div className="overflow-hidden rounded-3xl border border-[#E6EAF2] bg-white shadow-[0_8px_30px_rgba(23,32,51,0.08)]">
          <DigitalCard
            profile={profile}
            interactive
            showBrand
            showUrlBar
            onAddContact={downloadVcard}
          />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
