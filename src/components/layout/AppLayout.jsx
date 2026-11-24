import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, ChevronRight, Settings } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

// ── Avatar utility ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-purple-600',
  'bg-indigo-600',
  'bg-violet-700',
  'bg-fuchsia-700',
  'bg-blue-700',
];

function getAvatarColor(username = '') {
  const idx = username.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function UserAvatar({ user, size = 'sm' }) {
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';
  const sizeClass = size === 'md' ? 'w-9 h-9 text-sm' : 'w-8 h-8 text-xs';
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-elixir-border`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} ${getAvatarColor(user?.username)} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-elixir-border flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

// ── Breadcrumb generation from pathname ────────────────────────────────────────
function useBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const labelMap = {
    league: 'League',
    tournaments: 'Tournaments',
    leaderboard: 'Leaderboard',
    track: 'Track',
    clubs: 'Clubs',
    create: 'Create',
    shop: 'Shop',
    upgrade: 'Upgrade',
    admin: 'Admin',
    profile: 'Profile',
    games: 'Games',
    settings: 'Settings',
  };

  return segments.map((seg, i) => ({
    label: labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));
}

// ── Mock notifications ─────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Your tournament match starts in 30 minutes', time: '5m ago', read: false },
  { id: 2, text: 'You ranked up to Platinum III in Valorant', time: '1h ago', read: false },
  { id: 3, text: 'ValoElite Club accepted your join request', time: '3h ago', read: true },
  { id: 4, text: 'New tournament: Grand Siege Season 4 is open', time: '1d ago', read: true },
];

// ── Notification Bell ──────────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-ex-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-elixir-accent rounded-full ring-2 ring-elixir-bg-secondary" />
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-elixir-card border border-elixir-border rounded-xl shadow-2xl z-20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-elixir-border">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-primary">{unreadCount} new</span>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto no-scrollbar">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-elixir-border/50 last:border-0 hover:bg-white/3 transition-colors cursor-pointer ${
                    !n.read ? 'bg-elixir-secondary/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.read && (
                      <div className="w-2 h-2 bg-elixir-accent rounded-full mt-1.5 flex-shrink-0" />
                    )}
                    <div className={!n.read ? '' : 'pl-4'}>
                      <p className="text-sm text-ex-text-primary leading-snug">{n.text}</p>
                      <p className="text-xs text-ex-text-muted mt-0.5">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-elixir-border">
              <button className="text-xs text-elixir-accent-light hover:text-elixir-accent font-medium transition-colors w-full text-center">
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── AppLayout ──────────────────────────────────────────────────────────────────
export default function AppLayout({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Page title from last breadcrumb
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-elixir-bg overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <header className="flex-shrink-0 h-14 bg-elixir-bg-secondary border-b border-elixir-border flex items-center px-4 gap-3 z-30">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-ex-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
            <Link
              to="/league"
              className="text-ex-text-muted text-sm hover:text-white transition-colors hidden sm:block flex-shrink-0"
            >
              Home
            </Link>
            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb.path}>
                <ChevronRight size={14} className="text-ex-text-muted flex-shrink-0 hidden sm:block" />
                {crumb.isLast ? (
                  <span className="text-sm font-semibold text-white truncate">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-ex-text-muted text-sm hover:text-white transition-colors truncate hidden sm:block"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
            {/* Mobile: just show page title */}
            <span className="text-sm font-semibold text-white sm:hidden truncate">{pageTitle}</span>
          </nav>

          {/* Right: notifications + avatar */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <NotificationBell />

            <Link
              to="/settings"
              className="p-2 rounded-lg text-ex-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200 hidden sm:flex"
              aria-label="Settings"
            >
              <Settings size={19} />
            </Link>

            {/* Avatar + username */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200 group"
            >
              <UserAvatar user={user} size="sm" />
              <span className="text-sm font-medium text-ex-text-secondary group-hover:text-white transition-colors hidden lg:block">
                {user?.username || 'User'}
              </span>
            </button>
          </div>
        </header>

        {/* ── Scrollable page content ───────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
