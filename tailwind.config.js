import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Using modern `hsl`
        primary: {
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
          hover: 'hsl(var(--color-primary-hover) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary) / <alpha-value>)',
          hover: 'hsl(var(--color-secondary-hover) / <alpha-value>)',
        },
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        error: 'hsl(var(--color-error) / <alpha-value>)',
        'grayscale-0': 'hsl(var(--grayscale-0) / <alpha-value>)',
        'grayscale-10': 'hsl(var(--grayscale-10) / <alpha-value>)',
        'grayscale-20': 'hsl(var(--grayscale-20) / <alpha-value>)',
        'grayscale-30': 'hsl(var(--grayscale-30) / <alpha-value>)',
        'grayscale-60': 'hsl(var(--grayscale-60) / <alpha-value>)',
        'grayscale-70': 'hsl(var(--grayscale-70) / <alpha-value>)',
        'grayscale-90': 'hsl(var(--grayscale-90) / <alpha-value>)',
        'grayscale-100': 'hsl(var(--grayscale-100) / <alpha-value>)',
        'primary-60': 'hsl(var(--primary-60) / <alpha-value>)',
        'primary-70': 'hsl(var(--primary-70) / <alpha-value>)',
      },
      boxShadow: {
        default: '0px 0px 24px 0px rgba(0, 0, 0, 0.04)',
      },
      zIndex: {
        modals: 99999,
        notifications: 88888,
        'drop-zone': 55555,
      },
    },
  },
  plugins: [debugPlugin(), autocompleteCustomComponentsPlugin()],
};

/**
 * Custom plugin that provide auto-complete support for the listed classes.
 *
 * The style definitions can be found in `index.css` under the `@layer components {` section
 *
 */
function autocompleteCustomComponentsPlugin() {
  return plugin(function ({ addComponents }) {
    addComponents({
      '.btn-primary': {},
      '.debug-widget': {},
    });
  });
}

/**
 * The debugPlugin adds utility `debug*` classes to outline HTML nodes and childs.
 *
 */
function debugPlugin() {
  return plugin(function ({ addComponents }) {
    addComponents({
      '.debug': {
        outline: `solid thin red`,
      },
      '.debug-primary': {
        outline: `solid thin blue`,
      },
      '.debug-blue': {
        outline: 'solid thin blue',
      },
      '.debug-yellow': {
        outline: 'solid thin yellow',
      },
      '.debug-childs': {
        '& > *': {
          outline: 'solid thin red',
        },
      },
      '.debug-childs-blue': {
        '& > *': {
          outline: 'solid thin blue',
        },
      },
      '.debug-childs-yellow': {
        '& > *': {
          outline: 'solid thin yellow',
        },
      },
    });
  });
}
