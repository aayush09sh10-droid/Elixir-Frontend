import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Target,
  BarChart2,
  TrendingUp,
  Users,
  PlusCircle,
  ShoppingBag,
  Zap,
  Shield,
  LogOut,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Plug,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';

// ── Avatar utility ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-purple-600',
  'bg-indigo-600',
  'bg-violet-700',
  'bg-fuchsia-700',
  'bg-blue-700',
  'bg-cyan-700',
];

function getAvatarColor(username = '') {
  const idx = username.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function UserAvatar({ user, size = 'sm' }) {
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
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

// ── Nav item data ───────────────────────────────────────────────────────────────
const MAIN_NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: Trophy },
  { label: 'Tournaments', path: '/tournaments', icon: Target },
  { label: 'Rank', path: '/leaderboard', icon: BarChart2 },
  { label: 'Track', path: '/track', icon: TrendingUp },
];

const COMMUNITY_NAV = [
  { label: 'Clubs', path: '/clubs', icon: Users },
  { label: 'Create a Club', path: '/clubs/create', icon: PlusCircle },
];

const BOTTOM_NAV = [
  { label: 'Shop', path: '/shop', icon: ShoppingBag },
  { label: 'Upgrade', path: '/upgrade', icon: Zap, className: 'text-amber-400' },
];

// ── Single nav item ─────────────────────────────────────────────────────────────
function NavItem({ item, collapsed, isActive }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={`nav-item ${isActive ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''} ${item.className || ''}`}
    >
      <Icon
        size={18}
        className={`flex-shrink-0 ${item.className || (isActive ? 'text-elixir-accent-light' : '')}`}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

// ── Main Sidebar ────────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, isAdmin, logout } = useAuth();
  const { selectedGame } = useGame();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleBadgeClass =
    {
      admin: 'badge-error',
      organizer: 'badge-warning',
      user: 'badge-muted',
    }[user?.role] || 'badge-muted';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Collapse toggle (desktop) ─────────────────────────────────── */}
      <div className="hidden lg:flex items-center justify-between px-3 pt-4 pb-2">
        {!collapsed && (
          <span className="text-xs font-semibold tracking-widest text-ex-text-muted uppercase select-none">
            Menu
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-ex-text-muted hover:text-white hover:bg-white/5 transition-all duration-200 ${collapsed ? 'mx-auto' : 'ml-auto'}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="px-3 py-2">
        {searchOpen && !collapsed ? (
          <div className="flex items-center gap-2 bg-elixir-bg border border-elixir-border rounded-lg px-3 py-2">
            <Search size={14} className="text-ex-text-muted flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm text-white placeholder-ex-text-muted flex-1 min-w-0"
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-ex-text-muted hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (!collapsed) setSearchOpen(true);
            }}
            title={collapsed ? 'Search' : undefined}
            className={`nav-item w-full ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <Search size={18} className="flex-shrink-0 text-ex-text-muted" />
            {!collapsed && <span className="text-ex-text-muted">Search...</span>}
          </button>
        )}
      </div>

      {/* ── Selected game ───────────────────────────────────────────────── */}
      <div className="px-3 py-2">
        {selectedGame ? (
          <div
            className={`flex items-center gap-2.5 bg-elixir-primary/30 border border-elixir-secondary/30 rounded-lg px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? selectedGame.name : undefined}
          >
            <span className="text-xl flex-shrink-0">{selectedGame.icon || '🎮'}</span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs text-ex-text-muted font-medium leading-none mb-0.5">
                  Active Game
                </p>
                <p className="text-sm font-semibold text-white truncate">{selectedGame.name}</p>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`flex items-center gap-2.5 bg-white/5 border border-dashed border-elixir-border rounded-lg px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'No game selected' : undefined}
          >
            <Gamepad2 size={18} className="text-ex-text-muted flex-shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs text-ex-text-muted leading-none mb-0.5">No Game Selected</p>
                <p className="text-xs text-ex-text-muted/70 truncate">Pick a game to start</p>
              </div>
            )}
          </div>
        )}

        {!collapsed && (
          <Link
            to="/games"
            className="mt-2 flex items-center justify-center gap-1.5 w-full bg-elixir-secondary/70 hover:bg-elixir-accent text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-200 hover:shadow-glow-sm"
          >
            <Plug size={12} />
            Connect Game
          </Link>
        )}
      </div>

      <div className="mx-3 my-1 border-t border-elixir-border" />

      {/* ── Main navigation ─────────────────────────────────────────────── */}
      <nav className="px-3 py-2 flex flex-col gap-0.5">
        {!collapsed && (
          <p className="text-xs font-semibold text-ex-text-muted uppercase tracking-wider px-3 py-1 mb-1">
            Play
          </p>
        )}
        {MAIN_NAV.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={isActive(item.path)}
          />
        ))}
      </nav>

      <div className="mx-3 my-1 border-t border-elixir-border" />

      {/* ── Community ───────────────────────────────────────────────────── */}
      <nav className="px-3 py-2 flex flex-col gap-0.5">
        {!collapsed && (
          <p className="text-xs font-semibold text-ex-text-muted uppercase tracking-wider px-3 py-1 mb-1">
            Community
          </p>
        )}
        {COMMUNITY_NAV.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={isActive(item.path)}
          />
        ))}
      </nav>

      {/* ── Spacer ──────────────────────────────────────────────────────── */}
      <div className="flex-1" />

      <div className="mx-3 my-1 border-t border-elixir-border" />

      {/* ── Bottom nav (Shop, Upgrade) ──────────────────────────────────── */}
      <nav className="px-3 py-2 flex flex-col gap-0.5">
        {BOTTOM_NAV.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={isActive(item.path)}
          />
        ))}

        {/* Admin link */}
        {isAdmin && (
          <Link
            to="/admin"
            title={collapsed ? 'Admin Dashboard' : undefined}
            className={`nav-item text-red-400 hover:text-red-300 hover:bg-red-500/10 ${isActive('/admin') ? 'bg-red-500/15 border border-red-500/30' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <Shield size={18} className="flex-shrink-0 text-red-400" />
            {!collapsed && <span className="truncate">Admin Dashboard</span>}
          </Link>
        )}
      </nav>

      <div className="mx-3 my-1 border-t border-elixir-border" />

      {/* ── User profile footer ─────────────────────────────────────────── */}
      <div className={`px-3 py-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 group">
            <Link to="/profile" className="flex items-center gap-2.5 flex-1 min-w-0">
              <UserAvatar user={user} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.username || 'Guest'}
                </p>
                <span className={`badge text-[10px] px-1.5 py-0 ${roleBadgeClass}`}>
                  {user?.role || 'user'}
                </span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-ex-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <>
            <Link to="/profile" title={user?.username || 'Profile'}>
              <UserAvatar user={user} size="sm" />
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-ex-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-elixir-bg-secondary border-r border-elixir-border overflow-y-auto no-scrollbar transition-all duration-300 ease-in-out ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer panel */}
          <aside className="relative z-10 w-[240px] h-full bg-elixir-bg-secondary border-r border-elixir-border overflow-y-auto no-scrollbar flex flex-col">
            {/* Close button */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="gradient-text text-lg font-black tracking-tight">ELIXIR</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-ex-text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
