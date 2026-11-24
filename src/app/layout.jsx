import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { Card, Footer, Skeleton } from '../components/common/ui';

export function Heading({ title, subtitle, action }) {
  return (
    <div className="page-header flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Shell({ children }) {
  return (
    <>
      <Navbar />
      <div className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</div>
      </div>
      <Footer />
    </>
  );
}

export function AppFrame({ children }) {
  return <AppLayout>{children}</AppLayout>;
}

export function Gate({ roles, children }) {
  const { user, loading, logout } = useAuth();
  const loc = useLocation();
  if (loading)
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-64 space-y-3">
          <Skeleton className="h-5" />
          <Skeleton className="h-12" />
          <p className="text-sm text-ex-text-secondary">Restoring your ELIXIR session...</p>
        </div>
      </div>
    );
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (user.status !== 'active') {
    logout();
    return (
      <Navigate to="/login" state={{ message: 'Your account is currently restricted.' }} replace />
    );
  }
  if (roles && !roles.includes(user.role))
    return (
      <AppFrame>
        <Card>
          <h1 className="text-2xl font-bold">Access level required</h1>
          <p className="text-ex-text-secondary mt-2">
            This action is available to {roles.join(' or ')} accounts.
          </p>
          <Link className="btn-secondary inline-flex mt-5" to="/dashboard">
            Return to dashboard
          </Link>
        </Card>
      </AppFrame>
    );
  return <AppFrame>{children}</AppFrame>;
}

export function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-black">404</h1>
      <p className="text-ex-text-secondary mt-2">That page is not in this arena.</p>
      <Link to="/" className="btn-primary inline-flex mt-5">
        Back home
      </Link>
    </div>
  );
}
