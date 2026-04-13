import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  safelist: [
    'animate-fade-in-up',
    'animate-slide-up',
    'animate-slide-down',
    'animate-scale-in',
    'animate-accordion-down',
    'animate-bounce-in',
    'animate-float',
    'animate-float-delayed',
    'animate-expand',
    'animate-shake',
    'animate-pulse-slow',
    'animate-fade-in',
    'animation-delay-300',
    'animation-delay-500',
    'animation-delay-600',
    'animation-delay-700',
    'animation-delay-900',
    'animation-delay-1000',
  ],
  theme: {
    extend: {
      colors: {
        corp: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        page: "#f8fafc",
        ink: "#111827",
        muted: "#6b7280",
        accent: "#3b82f6",
        accentsoft: "#e8f0fe",
        success: "#6b9080",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        nav: "0 1px 0 0 rgb(15 23 42 / 0.06)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'slide-down': 'slide-down 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'accordion-down': 'accordion-down 0.4s ease-out forwards',
        'bounce-in': 'bounce-in 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 8s ease-in-out infinite',
        'expand': 'expand 1s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'fade-in': 'fade-in-up 0.6s ease-out forwards',
      },
      keyframes: {
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-down': {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' }
        },
        'accordion-down': {
          'from': { opacity: '0', height: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', height: 'auto', transform: 'translateY(0)' }
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(20px)' }
        },
        'expand': {
          'from': { width: '0' },
          'to': { width: '4rem' }
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      }
    },
  },
  plugins: [],
};

export default config;
