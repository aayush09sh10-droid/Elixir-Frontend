import React, { useEffect } from 'react';

export function Button({ children, kind = 'primary', className = '', ...props }) {
  const variant =
    kind === 'primary' ? 'btn-primary' : kind === 'danger' ? 'btn-danger' : 'btn-secondary';
  return (
    <button className={`${variant} justify-center ${className}`} {...props}>
      {children}
    </button>
  );
}
export function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function Badge({ children, tone = 'primary' }) {
  return <span className={`badge-${tone}`}>{children}</span>;
}
export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}
export function Modal({ open, title, children, onClose, actions }) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="card w-full max-w-lg shadow-2xl"
      >
        <h2 id="modal-title" className="text-xl font-bold">
          {title}
        </h2>
        <div className="mt-3 text-ex-text-secondary">{children}</div>
        <div className="mt-6 flex justify-end gap-2">{actions}</div>
      </section>
    </div>
  );
}
export function Footer() {
  return (
    <footer className="border-t border-elixir-border mt-16 py-8 px-5 text-center text-sm text-ex-text-muted">
      © 2026 ELIXIR · Play. Evolve. Earn.{' '}
      <span className="block mt-1">
        Demo platform — authentication, rankings and purchases are simulated.
      </span>
    </footer>
  );
}
