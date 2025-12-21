import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Archivo', 'Inter', ...defaultTheme.fontFamily.sans],
        heading: ['Archivo', 'Inter', ...defaultTheme.fontFamily.sans],
        archivo: ['Archivo', ...defaultTheme.fontFamily.sans],
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      colors: {
        // === PREMIUM GLASSMORPHISM PALETTE (identyczne z LocalServices) ===
        primary: {
          DEFAULT: '#06B6D4', // Cyan-500
          light: '#22D3EE',   // Cyan-400
          dark: '#0891B2',    // Cyan-600
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        accent: {
          DEFAULT: '#3B82F6', // Blue-500
          light: '#60A5FA',   // Blue-400
          dark: '#2563EB',    // Blue-600
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Glassmorphism: White with opacity (light mode) & Dark mode variants
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          DEFAULT: 'rgba(255, 255, 255, 0.9)',
          dark: 'rgba(255, 255, 255, 0.6)',
          nav: 'rgba(255, 255, 255, 0.95)',
          border: 'rgba(255, 255, 255, 0.3)',
          'dark-light': 'rgba(15, 23, 42, 0.7)',
          'dark-DEFAULT': 'rgba(15, 23, 42, 0.9)',
          'dark-dark': 'rgba(15, 23, 42, 0.6)',
          'dark-nav': 'rgba(15, 23, 42, 0.95)',
          'dark-border': 'rgba(71, 85, 105, 0.3)',
        },
        // Neutrals
        black: '#121212',
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#CCCCCC',
          400: '#999999',
          500: '#666666',
          600: '#424242',
          700: '#333333',
          800: '#1D1D1D',
        },
        // Semantic Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      backgroundImage: {
        'gradient-search': 'linear-gradient(135deg, #0891B2 0%, #06B6D4 50%, #0E7490 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0891B2 0%, #06B6D4 50%, #0E7490 100%)',
        'gradient-sunrise': 'linear-gradient(120deg, #06B6D4 0%, #3B82F6 35%, #8B5CF6 68%, #EC4899 100%)',
        'gradient-card-glow': 'radial-gradient(circle at top, rgba(34, 211, 238, 0.35), transparent 55%)',
      },
      borderRadius: {
        'md': '0.75rem',   // 12px
        'lg': '1rem',      // 16px
        'xl': '1.5rem',    // 24px
        '2xl': '2rem',     // 32px
        '3xl': '3rem',     // 48px
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31,38,135,0.15)',
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 0.4s ease-in-out',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(120px, -100px) scale(1.4)' },
          '66%': { transform: 'translate(-80px, 80px) scale(0.7)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    forms,
    // Utilities zgodne z design systemem LocalServices (globalne, bez potrzeby importu CSS)
    function({ addComponents, addUtilities, theme }) {
      addComponents({
        '.glass-card': {
          backgroundColor: theme('colors.glass.DEFAULT'),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${theme('colors.glass.border')}`,
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.glass'),
          '.dark &': {
            backgroundColor: theme('colors.glass.dark-DEFAULT'),
            borderColor: theme('colors.glass.dark-border'),
          },
        },
        '.glass-nav': {
          backgroundColor: theme('colors.glass.nav'),
          backdropFilter: 'blur(16px'),
          borderBottom: `1px solid ${theme('colors.glass.border')}`,
          boxShadow: theme('boxShadow.md'),
          '.dark &': {
            backgroundColor: theme('colors.glass.dark-nav'),
            borderBottomColor: theme('colors.glass.dark-border'),
          },
        },
      });

      addUtilities({
        '.gradient-primary': {
          backgroundImage: theme('backgroundImage.gradient-sunrise'),
        },
        '.text-gradient': {
          backgroundImage: theme('backgroundImage.gradient-hero'),
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        },
        '.text-gradient-strong': {
          backgroundImage: theme('backgroundImage.gradient-hero'),
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: 'contrast(1.06)',
        },
        '.hero-gradient': {
          backgroundImage: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 25%, #3B82F6 50%, #8B5CF6 75%, #EC4899 100%)',
        },
        '.icon-gradient-1': {
          backgroundImage: 'linear-gradient(to bottom right, #22D3EE, #3B82F6)',
        },
        '.icon-gradient-2': {
          backgroundImage: 'linear-gradient(to bottom right, #A78BFA, #EC4899)',
        },
        '.icon-gradient-3': {
          backgroundImage: 'linear-gradient(to bottom right, #34D399, #14B8A6)',
        },
        '.badge-gradient': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: theme('spacing.1'),
          paddingInline: theme('spacing.2'),
          paddingBlock: theme('spacing.1'),
          fontSize: theme('fontSize.xs')[0],
          fontWeight: theme('fontWeight.semibold'),
          borderRadius: theme('borderRadius.full'),
          backgroundImage: theme('backgroundImage.gradient-hero'),
          color: theme('colors.white'),
          letterSpacing: '0.02em',
        },
        '.btn-gradient': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme('spacing.2'),
          paddingInline: theme('spacing.5'),
          paddingBlock: theme('spacing.3'),
          fontWeight: theme('fontWeight.semibold'),
          color: theme('colors.white'),
          borderRadius: theme('borderRadius.xl'),
          backgroundImage: theme('backgroundImage.gradient-sunrise'),
          boxShadow: theme('boxShadow.glass'),
          transition: 'all 180ms ease',
        },
        '.btn-gradient:hover': {
          filter: 'brightness(1.05)',
          transform: 'translateY(-1px)',
        },
        '.card-hover': {
          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.card-hover:hover': {
          boxShadow: theme('boxShadow.xl'),
          transform: 'translateY(-4px)',
        },
      });
    },
  ],
};
