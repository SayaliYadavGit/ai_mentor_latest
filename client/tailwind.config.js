/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ✏️ CUSTOMIZE THIS - Color Scheme
      colors: {
        // Primary brand color (Hantec red)
        primary: {
          DEFAULT: '#8B0000',
          hover: '#A00000',
          light: '#B22222',
          dark: '#5C0000',
        },
        // Background colors (from UI)
        background: {
          DEFAULT: '#F5F5F7',     // Main background
          card: '#FFFFFF',         // Card background
          secondary: '#FAFAFA',    // Secondary background
          dark: '#1a202c',
        },
        // Text colors (from UI)
        text: {
          primary: '#1A1A1A',      // Main headings
          secondary: '#666666',    // Body text
          muted: '#999999',        // Placeholder text
          onRed: '#FFFFFF',        // Text on red background
        },
        // Border colors
        border: {
          light: '#E5E5E5',
          card: '#F0F0F0',
        },
        // Accent colors for icons/badges
        accent: {
          blue: '#3B82F6',
          red: '#EF4444',
          yellow: '#F59E0B',
          purple: '#A855F7',
        },
      },
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}