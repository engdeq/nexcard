import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const COPYRIGHT_YEAR = 2026;

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo showTagline />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Create QR codes and digital business profiles that make sharing your
            business simple.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-text">Product</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <Link to="/login" className="hover:text-primary">
              Login
            </Link>
            <Link to="/app/create" className="hover:text-primary">
              Create QR Code
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-text">Help</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <span>Support contact coming soon</span>
            <Link to="/app/settings" className="hover:text-primary">
              Account settings
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-text">Legal</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted">
        © {COPYRIGHT_YEAR} NexaCard. All rights reserved.
      </div>
    </footer>
  );
}
