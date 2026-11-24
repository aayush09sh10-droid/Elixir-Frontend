/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        elixir: {
          primary: '#27044f',
          secondary: '#440f80',
          indigo: '#28196b',
          bg: '#0D0B12',
          'bg-secondary': '#15121D',
          card: '#1B1725',
          border: '#2D2640',
          'border-light': '#3D3550',
          accent: '#7C3AED',
          'accent-light': '#A78BFA',
        },
        'ex-text': {
          primary: '#FFFFFF',
          secondary: '#A6A1B1',
          muted: '#6B6580',
        },
        'ex-success': '#22C55E',
        'ex-warning': '#F59E0B',
        'ex-error': '#EF4444',
        'ex-info': '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'elixir-gradient': 'linear-gradient(135deg, #27044f 0%, #440f80 50%, #28196b 100%)',
        'card-gradient': 'linear-gradient(145deg, #1B1725 0%, #15121D 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(68, 15, 128, 0.4) 0%, rgba(13, 11, 18, 0) 70%)',
      },
      boxShadow: {
        'elixir': '0 0 20px rgba(68, 15, 128, 0.3)',
        'elixir-sm': '0 0 10px rgba(68, 15, 128, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 30px rgba(124, 58, 237, 0.4)',
        'glow-sm': '0 0 15px rgba(124, 58, 237, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(124, 58, 237, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(124, 58, 237, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
