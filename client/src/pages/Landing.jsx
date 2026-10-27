import { Link, Navigate } from 'react-router-dom';
import { Contact, QrCode, Smartphone } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { Logo } from '../components/Logo';
import { SiteFooter } from '../components/SiteFooter';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo showTagline />
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Register now</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:pt-12">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#4f6ef7] to-secondary px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
              Create • Share • Connect
            </span>
            <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              QR codes & digital cards, simply made.
            </h1>
            <p className="mt-3 text-sm text-white/85 sm:text-base">
              NexaCard helps you create, customize, and share QR codes and
              digital business profiles in minutes.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/register">
                <Button variant="white">Get started free</Button>
              </Link>
              <Link to="/login">
                <Button className="border border-white/30 bg-transparent text-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: QrCode,
              title: 'QR Generator',
              text: 'Website, Wi-Fi, vCard, PDF, and more.',
            },
            {
              icon: Contact,
              title: 'Digital Cards',
              text: 'Publish a public profile with a unique link.',
            },
            {
              icon: Smartphone,
              title: 'Live Preview',
              text: 'See exactly how your card looks on mobile.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <Card key={title} className="!p-4">
              <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={16} />
              </div>
              <h3 className="font-display text-sm font-bold text-text">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </Card>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
