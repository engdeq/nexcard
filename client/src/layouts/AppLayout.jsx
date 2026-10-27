import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ChevronDown,
  Contact,
  Crown,
  LayoutDashboard,
  LayoutTemplate,
  List,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const nav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/create', label: 'Create QR Code', icon: QrCode },
  { to: '/app/qr-codes', label: 'My QR Codes', icon: List },
  { to: '/app/business-card', label: 'Business Card', icon: Contact },
  { to: '/app/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/website-ads', label: 'Website & Ads', icon: Megaphone },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

const pageTitles = {
  '/app': 'Dashboard',
  '/app/create': 'Create QR Code',
  '/app/qr-codes': 'My QR Codes',
  '/app/business-card': 'Business Card',
  '/app/templates': 'Templates',
  '/app/analytics': 'Analytics',
  '/app/website-ads': 'Website & Ads',
  '/app/settings': 'Settings',
};

function NavItems({ collapsed, onNavigate }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition ${
              collapsed ? 'justify-center' : ''
            } ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:bg-bg hover:text-text'
            }`
          }
        >
          <Icon size={17} className="shrink-0" />
          {!collapsed && <span className="truncate">{label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('nexacard_sidebar') === 'collapsed';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  const title = useMemo(() => {
    if (location.pathname.startsWith('/app/create')) return 'Create QR Code';
    return pageTitles[location.pathname] || 'NexaCard';
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem(
      'nexacard_sidebar',
      collapsed ? 'collapsed' : 'expanded'
    );
  }, [collapsed]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/app/qr-codes?search=${encodeURIComponent(q)}` : '/app/qr-codes');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex min-h-screen w-full">
        {/* Desktop sidebar */}
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex ${
            collapsed ? 'w-[72px]' : 'w-[240px]'
          }`}
        >
          <div className={`flex items-center gap-2 border-b border-border px-3 py-3.5 ${collapsed ? 'justify-center' : ''}`}>
            {collapsed ? <Logo compact /> : <Logo showTagline />}
          </div>

          <div className="flex-1 overflow-y-auto px-2.5 py-3">
            {!collapsed && (
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Menu
              </p>
            )}
            <NavItems collapsed={collapsed} />
          </div>

          {!collapsed && (
            <div className="mx-2.5 mb-3 rounded-2xl bg-gradient-to-br from-secondary to-primary p-3.5 text-white">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                <Crown size={16} />
              </div>
              <p className="font-display text-sm font-bold">Unlock More Features</p>
              <ul className="mt-2 space-y-1 text-[11px] text-white/85">
                <li>• Custom branded QR styles</li>
                <li>• More digital profiles</li>
                <li>• Advanced analytics soon</li>
              </ul>
              <button
                type="button"
                onClick={() => navigate('/app/settings')}
                className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-secondary transition hover:bg-white/90"
              >
                Explore Plans
              </button>
              <p className="mt-2 text-[10px] text-white/70">
                Informational only — billing is not enabled yet.
              </p>
            </div>
          )}

          <div className="border-t border-border p-2.5">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-medium text-muted hover:bg-bg hover:text-text"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              {!collapsed && 'Collapse'}
            </button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-navy/40"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
            <aside className="absolute inset-y-0 left-0 flex w-[250px] flex-col bg-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-3 py-3.5">
                <Logo showTagline />
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-muted hover:bg-bg"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-2.5 py-3">
                <NavItems onNavigate={() => setMobileOpen(false)} />
              </div>
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-5 lg:px-6">
            <button
              type="button"
              className="rounded-xl border border-border p-2 text-text lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>

            <div className="hidden min-w-0 sm:block">
              <p className="truncate font-display text-sm font-bold text-text">{title}</p>
              <p className="truncate text-[11px] text-muted">NexaCard workspace</p>
            </div>

            <form onSubmit={onSearch} className="mx-auto hidden max-w-md flex-1 md:block">
              <label className="relative block">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search QR codes, profiles..."
                  className="w-full rounded-xl border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
            </form>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-xl border border-border p-2 text-muted hover:bg-bg hover:text-text"
                aria-label="Toggle theme"
                title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                type="button"
                className="relative rounded-xl border border-border p-2 text-muted hover:bg-bg hover:text-text"
                aria-label="Notifications"
                title="No new notifications"
              >
                <Bell size={16} />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-border py-1 pl-1 pr-2 hover:bg-bg"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[11px] font-bold text-white">
                    {initials}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block max-w-[100px] truncate text-xs font-semibold text-text">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <span className="block text-[10px] text-muted">Owner</span>
                  </span>
                  <ChevronDown size={14} className="hidden text-muted sm:block" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
                    <div className="border-b border-border px-3 py-2">
                      <p className="truncate text-sm font-semibold text-text">{user?.name}</p>
                      <p className="truncate text-xs text-muted">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text hover:bg-bg"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/app/settings');
                      }}
                    >
                      <Settings size={15} />
                      Settings
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-bg"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
