// Premium Sports Design System
// Inspired by modern athletic brands and professional sports aesthetics

export const COLORS = {
  // Primary Brand Colors - Deep athletic navy and energetic orange
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    200: '#c7d7fe',
    300: '#a5b9fc',
    400: '#8195f8',
    500: '#5d6ff2',
    600: '#4c5ce8',
    700: '#3e4ad4',
    800: '#333dab',
    900: '#1e2875', // Deep navy - primary brand color
    950: '#0f1442'
  },

  // Secondary - Athletic orange/amber for energy and action
  secondary: {
    50: '#fefdf0',
    100: '#fef9e0',
    200: '#fcf1b8',
    300: '#f9e485',
    400: '#f5d249', // Energetic amber
    500: '#f1c425',
    600: '#e5a914',
    700: '#c18712',
    800: '#9d6a16',
    900: '#825717',
    950: '#4a2e08'
  },

  // Success - Professional green for positive states
  success: {
    50: '#f0fdf9',
    100: '#dcfcf0',
    200: '#bbf7e1',
    300: '#86efca',
    400: '#4ade80', // Clean success green
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },

  // Error - Strong but professional red for violations
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Professional error red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  // Warning - Sophisticated amber for caution states
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Professional warning amber
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  // Neutrals - Clean, modern grays for professional feel
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  },

  // Court Colors - Specialized for volleyball court elements
  court: {
    surface: {
      legal: 'linear-gradient(135deg, #f0fdf9 0%, #dcfce7 100%)', // Subtle green
      violation: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', // Subtle red
      neutral: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' // Clean slate
    },
    lines: '#1e2875', // Primary navy for court lines
    net: '#262626', // Strong neutral for net
    zones: '#525252' // Medium neutral for zone labels
  }
};

export const TYPOGRAPHY = {
  // Font weights for hierarchy
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },

  // Size scale optimized for sports UI
  sizes: {
    xs: '0.75rem',    // 12px - small labels
    sm: '0.875rem',   // 14px - body text
    base: '1rem',     // 16px - default
    lg: '1.125rem',   // 18px - headings
    xl: '1.25rem',    // 20px - section titles
    '2xl': '1.5rem',  // 24px - page titles
    '3xl': '1.875rem', // 30px - hero text
    '4xl': '2.25rem'  // 36px - display
  }
};

export const SPACING = {
  // Consistent spacing scale
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  '4xl': '2.5rem', // 40px
  '5xl': '3rem'    // 48px
};

export const SHADOWS = {
  // Subtle, professional shadows
  sm: '0 1px 2px 0 rgba(30, 40, 117, 0.05)',
  md: '0 4px 6px -1px rgba(30, 40, 117, 0.1), 0 2px 4px -1px rgba(30, 40, 117, 0.06)',
  lg: '0 10px 15px -3px rgba(30, 40, 117, 0.1), 0 4px 6px -2px rgba(30, 40, 117, 0.05)',
  xl: '0 20px 25px -5px rgba(30, 40, 117, 0.1), 0 10px 10px -5px rgba(30, 40, 117, 0.04)'
};

export const BORDERS = {
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px'
  }
};

// Component-specific style helpers
export const COMPONENT_STYLES = {
  card: {
    base: 'bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-md',
    elevated: 'bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-lg',
    interactive: 'transition-all duration-200 hover:shadow-lg hover:scale-[1.02]'
  },

  button: {
    primary: 'bg-primary-900 hover:bg-primary-800 text-white shadow-md hover:shadow-lg transition-all duration-200',
    secondary: 'bg-secondary-400 hover:bg-secondary-500 text-primary-900 shadow-md hover:shadow-lg transition-all duration-200',
    success: 'bg-success-500 hover:bg-success-600 text-white shadow-md hover:shadow-lg transition-all duration-200',
    error: 'bg-error-500 hover:bg-error-600 text-white shadow-md hover:shadow-lg transition-all duration-200',
    neutral: 'bg-neutral-600 hover:bg-neutral-700 text-white shadow-md hover:shadow-lg transition-all duration-200'
  },

  status: {
    success: 'bg-gradient-to-r from-success-50 to-success-100 border-2 border-success-200 text-success-800',
    error: 'bg-gradient-to-r from-error-50 to-error-100 border-2 border-error-200 text-error-800',
    warning: 'bg-gradient-to-r from-warning-50 to-warning-100 border-2 border-warning-200 text-warning-800',
    neutral: 'bg-gradient-to-r from-neutral-50 to-neutral-100 border-2 border-neutral-200 text-neutral-800'
  }
};

// Player colors using the new system
export const PLAYER_COLORS_NEW = {
  1: 'bg-error-500',      // Strong red for visibility
  2: 'bg-primary-600',    // Primary blue
  3: 'bg-success-500',    // Professional green
  4: 'bg-secondary-400',  // Energetic amber
  5: 'bg-warning-500',    // Professional orange
  6: 'bg-neutral-700'     // Strong neutral
};