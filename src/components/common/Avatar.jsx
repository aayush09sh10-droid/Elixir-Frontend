import React from 'react';

// Generate a consistent color from a string
const stringToColor = (str = '') => {
  const colors = [
    'from-purple-600 to-indigo-700',
    'from-violet-600 to-purple-700',
    'from-indigo-600 to-blue-700',
    'from-fuchsia-600 to-pink-700',
    'from-cyan-600 to-blue-700',
    'from-emerald-600 to-teal-700',
    'from-orange-600 to-red-700',
    'from-rose-600 to-pink-700',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = '') => {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Avatar = ({
  username = '',
  src = null,
  size = 'md',
  className = '',
  showBorder = false,
  online = false,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
    '3xl': 'w-32 h-32 text-4xl',
  };

  const gradient = stringToColor(username);
  const initials = getInitials(username);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          bg-gradient-to-br ${gradient}
          flex items-center justify-center
          font-bold text-white
          ${showBorder ? 'ring-2 ring-elixir-secondary ring-offset-2 ring-offset-elixir-bg' : ''}
          overflow-hidden
          flex-shrink-0
        `}
      >
        {src ? (
          <img src={src} alt={username} className="w-full h-full object-cover" />
        ) : (
          <span className="select-none">{initials || '?'}</span>
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-ex-success rounded-full border-2 border-elixir-bg" />
      )}
    </div>
  );
};

export default Avatar;
