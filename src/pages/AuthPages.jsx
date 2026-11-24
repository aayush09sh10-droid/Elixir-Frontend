import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/common/ui';
import { Shell } from '../app/layout';

const Btn = Button;

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    try {
      login(d.get('email'), d.get('password'));
      nav(loc.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (x) {
      setErr(x.message);
    }
  };
  const demoLogin = () => {
    try {
      login('player@elixir.gg', 'Player@123');
      nav(loc.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (x) {
      setErr(x.message);
    }
  };
  return (
    <Shell>
      <div className="max-w-md mx-auto">
        <Card>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-ex-text-secondary mt-2">Sign in to continue your run.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm">
              Email
              <input
                className="input mt-1"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </label>
            <label className="block text-sm">
              Password
              <input
                className="input mt-1"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </label>
            {err && (
              <p role="alert" className="text-red-400 text-sm">
                {err}
              </p>
            )}
            <Btn className="w-full">Sign in</Btn>
          </form>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button className="btn-secondary justify-center" onClick={demoLogin}>
              Google (demo)
            </button>
            <button className="btn-secondary justify-center" onClick={demoLogin}>
              Steam (demo)
            </button>
          </div>
          <p className="text-xs text-ex-text-muted mt-2">
            Simulated sign-in only. No OAuth provider is configured.
          </p>
          <div className="mt-5 p-3 rounded-lg bg-white/5 text-xs text-ex-text-secondary">
            Demo accounts: player@elixir.gg / Player@123 · organizer@elixir.gg / Org@123 ·
            admin@elixir.gg / Admin@123
          </div>
          <p className="mt-4 text-sm text-ex-text-secondary">
            Demo only:{' '}
            <button className="underline" onClick={demoLogin}>
              Continue with demo account
            </button>
          </p>
          <p className="mt-4 text-sm">
            New to ELIXIR?{' '}
            <Link className="text-elixir-accent-light" to="/register">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </Shell>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    if (d.password.length < 8) return setErr('Use at least 8 characters for your password.');
    if (d.password !== d.confirm) return setErr('Passwords do not match.');
    try {
      register(d);
      nav('/select-game');
    } catch (x) {
      setErr(x.message);
    }
  };
  return (
    <Shell>
      <div className="max-w-lg mx-auto">
        <Card>
          <h1 className="text-3xl font-bold">Create your player profile</h1>
          <form onSubmit={submit} className="mt-6 grid sm:grid-cols-2 gap-4">
            {[
              ['fullName', 'Full name', 'text'],
              ['username', 'Username', 'text'],
              ['email', 'Email', 'email'],
              ['dob', 'Date of birth', 'date'],
              ['password', 'Password', 'password'],
              ['confirm', 'Confirm password', 'password'],
            ].map(([n, l, t]) => (
              <label key={n} className="text-sm">
                {l}
                <input
                  className="input mt-1"
                  type={t}
                  name={n}
                  required
                  minLength={n.includes('password') ? 8 : undefined}
                />
              </label>
            ))}
            {err && (
              <p className="sm:col-span-2 text-red-400 text-sm" role="alert">
                {err}
              </p>
            )}
            <Btn className="sm:col-span-2">Create account</Btn>
          </form>
          <p className="mt-4 text-xs text-ex-text-muted">
            Mock account only. Do not reuse a real password.
          </p>
        </Card>
      </div>
    </Shell>
  );
}
