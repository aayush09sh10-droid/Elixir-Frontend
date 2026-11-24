import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, Gamepad2 } from 'lucide-react';
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

function UserAvatar({ user }) {
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username}
        className="w-8 h-8 rounded-full object-cover ring-2 ring-elixir-accent/40"
      />
    );
  }
  return (
    <div
      className={`w-8 h-8 ${getAvatarColor(user?.username)} rounded-full flex items-center justify-center font-bold text-white text-xs ring-2 ring-elixir-accent/40 flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

// ── Nav links ──────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Games', path: '/games' },
  { label: 'Tournaments', path: '/tournaments' },
  { label: 'About', path: '/#about' },
  { label: 'Community', path: '/clubs' },
];

// ── Navbar ─────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled || mobileOpen
            ? 'bg-elixir-bg/90 backdrop-blur-md border-b border-elixir-border shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ───────────────────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-elixir-secondary to-elixir-accent rounded-lg flex items-center justify-center shadow-glow-sm">
                <Gamepad2 size={16} className="text-white" />
              </div>
              <div>
                <span className="gradient-text text-xl font-black tracking-tight leading-none">
                  ELIXIR
                </span>
                <p className="text-[9px] text-ex-text-muted tracking-widest font-medium leading-none hidden sm:block">
                  ESPORTS PLATFORM
                </p>
              </div>
            </Link>

            {/* ── Desktop nav links ──────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-white bg-white/8'
                      : 'text-ex-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Right section ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                /* Logged-in state */
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 text-sm text-ex-text-secondary">
                    <UserAvatar user={user} />
                    <span className="font-medium text-white hidden lg:block">{user?.username}</span>
                  </div>
                  <button
                    onClick={() => navigate('/league')}
                    className="btn-primary btn-sm"
                  >
                    Dashboard
                    <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                /* Logged-out state */
                <>
                  <Link to="/login" className="btn-ghost btn-sm hidden sm:inline-flex">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary btn-sm">
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-ex-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ────────────────────────────────────────────────── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-elixir-border bg-elixir-bg/95 backdrop-blur-md px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-white bg-elixir-secondary/30 border border-elixir-secondary/40'
                    : 'text-ex-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile auth buttons */}
            <div className="border-t border-elixir-border mt-2 pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/league')}
                  className="btn-primary w-full justify-center"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary w-full justify-center">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary w-full justify-center">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
