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
        'resizer-bg': {
          hover: 'rgb(var(--grayscale-40) / <alpha-value>)',
          default: 'rgb(var(--grayscale-20) / <alpha-value>)',
        },
        'btn-ico-modal-item': {
          active: 'rgb(var(--grayscale-80) / <alpha-value>)',
          hover: 'rgb(var(--grayscale-80) / <alpha-value>)',
          default: 'rgb(var(--grayscale-70) / <alpha-value>)',
        },
        'btn-txt-modal-item': {
          hover: 'rgb(var(--grayscale-80) / <alpha-value>)',
          active: 'rgb(var(--grayscale-80) / <alpha-value>)',
          default: 'rgb(var(--grayscale-70) / <alpha-value>)',
        },
        'modal-ico-placeholder': 'rgb(var(--grayscale-40) / <alpha-value>)',
        'modal-txt-placeholder': 'rgb(var(--grayscale-40) / <alpha-value>)',
        'modal-border': 'rgb(var(--grayscale-20) / <alpha-value>)',
        'modal-txt': {
          secondary: 'rgb(var(--grayscale-60) / <alpha-value>)',
          primary: 'rgb(var(--grayscale-80) / <alpha-value>)',
        },
        'modal-bg': {
          secondary: 'rgb(var(--grayscale-10) / <alpha-value>)',
          primary: 'rgb(var(--grayscale-00) / <alpha-value>)',
          overlay: 'rgb(var(--grayscale-60) / <alpha-value>)',
        },
        'card-txt': {
          tertiary: 'rgb(var(--grayscale-60) / <alpha-value>)',
          secondary: 'rgb(var(--grayscale-70) / <alpha-value>)',
          primary: 'rgb(var(--grayscale-80) / <alpha-value>)',
        },
        'card-ico': {
          primary: 'rgb(var(--grayscale-80) / <alpha-value>)',
        },
        'input-txt': {
          disabled: 'rgb(var(--grayscale-60) / <alpha-value>)',
          secondary: 'rgb(var(--grayscale-70) / <alpha-value>)',
          primary: 'rgb(var(--grayscale-80) / <alpha-value>)',
        },
        'btn-bg-side-bar-icon': {
          hover: 'rgb(var(--grayscale-20) / <alpha-value>)',
          default: 'rgb(var(--grayscale-00) / <alpha-value>)',
        },
        'btn-ico-side-bar-tool': {
          disabled: 'rgb(var(--grayscale-20) / <alpha-value>)',
          hover: 'rgb(var(--grayscale-70) / <alpha-value>)',
          default: 'rgb(var(--grayscale-60) / <alpha-value>)',
          active: 'rgb(var(--grayscale-70) / <alpha-value>)',
        },
        'btn-ico-tool': {
          disabled: 'rgb(var(--grayscale-40) / <alpha-value>)',
          default: 'rgb(var(--grayscale-70) / <alpha-value>)',
          hover: 'rgb(var(--grayscale-80) / <alpha-value>)',
          active: 'rgb(var(--grayscale-80) / <alpha-value>)',
        },
        'btn-bg-tool': {
          active: 'rgb(var(--grayscale-20) / <alpha-value>)',
          disabled: 'rgb(var(--grayscale-00) / <alpha-value>)',
          hover: 'rgb(var(--grayscale-20) / <alpha-value>)',
          default: 'rgb(var(--grayscale-00) / <alpha-value>)',
        },
        'content-area-border': 'rgb(var(--grayscale-30) / <alpha-value>)',
        'status-bar-txt': 'rgb(var(--grayscale-20) / <alpha-value>)',
        'btn-bg-side-bar-tool': {
          active: 'rgb(var(--grayscale-20) / <alpha-value>)',
          disabled: 'rgb(var(--grayscale-00) / <alpha-value>)',
          default: 'rgb(var(--grayscale-00) / <alpha-value>)',
          hover: 'rgb(var(--grayscale-20) / <alpha-value>)',
        },
        'btn-txt-side-bar-item': { primary: 'rgb(var(--grayscale-80) / <alpha-value>)' },
        'btn-bg-side-bar-item': {
          active: 'rgb(var(--grayscale-20) / <alpha-value>)',
          hover: 'rgb(var(--grayscale-20) / <alpha-value>)',
          default: 'rgb(var(--grayscale-00) / <alpha-value>)',
        },
        'btn-bg-top-bar': {
          inactive: 'rgb(var(--grayscale-30) / <alpha-value>)',
          active: 'rgb(var(--grayscale-10) / <alpha-value>)',
        },
        'btn-ico-content': 'rgb(var(--grayscale-80) / <alpha-value>)',
        'btn-ico-side-bar-icon': {
          hover: 'rgb(var(--grayscale-70) / <alpha-value>)',
          default: 'rgb(var(--grayscale-60) / <alpha-value>)',
          disabled: 'rgb(var(--grayscale-40) / <alpha-value>)',
        },
        'input-border': {
          active: 'rgb(var(--primary-50) / <alpha-value>)',
          disabled: 'rgb(var(--grayscale-20) / <alpha-value>)',
          default: 'rgb(var(--grayscale-20) / <alpha-value>)',
        },
        'input-bg': {
          disabled: 'rgb(var(--grayscale-20) / <alpha-value>)',
          default: 'rgb(var(--grayscale-00) / <alpha-value>)',
        },
        'status-bar-border': 'rgb(var(--grayscale-70) / <alpha-value>)',
        'btn-ico-top-bar': {
          inactive: 'rgb(var(--grayscale-70) / <alpha-value>)',
          active: 'rgb(var(--grayscale-80) / <alpha-value>)',
        },
        'btn-txt-top-bar': {
          inactive: 'rgb(var(--grayscale-70) / <alpha-value>)',
          active: 'rgb(var(--grayscale-80) / <alpha-value>)',
        },
        'top-bar-bg': {
          active: 'rgb(var(--grayscale-10) / <alpha-value>)',
          inactive: 'rgb(var(--grayscale-30) / <alpha-value>)',
        },
        'top-bar-border': 'rgb(var(--grayscale-50) / <alpha-value>)',
        'content-area-bg': {
          primary: 'rgb(var(--grayscale-10) / <alpha-value>)',
          secondary: 'rgb(var(--grayscale-30) / <alpha-value>)',
        },
        'side-bar-txt': {
          primary: 'rgb(var(--grayscale-80) / <alpha-value>)',
          secondary: 'rgb(var(--grayscale-70) / <alpha-value>)',
        },
        'side-bar-border': 'rgb(var(--grayscale-20) / <alpha-value>)',
        'side-bar-bg': {
          primary: 'rgb(var(--grayscale-00) / <alpha-value>)',
          secondary: 'rgb(var(--grayscale-20) / <alpha-value>)',
        },
        'side-bar-ico-empty': 'rgb(var(--grayscale-40) / <alpha-value>)',
        'card-txt-header': 'rgb(var(--grayscale-00) / <alpha-value>)',
        'card-border-header': 'rgb(var(--primary-90) / <alpha-value>)',
        'card-border': {
          secondary: 'rgb(var(--grayscale-40) / <alpha-value>)',
          primary: 'rgb(var(--grayscale-20) / <alpha-value>)',
        },
        'status-bar-ico': 'rgb(var(--grayscale-20) / <alpha-value>)',
        'btn-ico-primary': {
          default: 'rgb(var(--grayscale-00) / <alpha-value>)',
          disabled: 'rgb(var(--grayscale-40) / <alpha-value>)',
        },
        'input-bg-action': 'rgb(var(--primary-50) / <alpha-value>)',
        'btn-bg-modal-item': {
          default: 'rgb(var(--grayscale-00) / <alpha-value>)',
          hover: 'rgb(var(--grayscale-20) / <alpha-value>)',
        },
        'card-bg-header': 'rgb(var(--primary-50) / <alpha-value>)',
        'card-bg': {
          secondary: 'rgb(var(--grayscale-20) / <alpha-value>)',
          primary: 'rgb(var(--grayscale-00) / <alpha-value>)',
        },
        'status-bar-bg': 'rgb(var(--grayscale-90) / <alpha-value>)',
        'input-txt-placeholder': 'rgb(var(--grayscale-60) / <alpha-value>)',
        'btn-ico-secondary': {
          default: 'rgb(var(--grayscale-80) / <alpha-value>)',
          disabled: 'rgb(var(--grayscale-40) / <alpha-value>)',
        },
        'input-ico-placeholder': 'rgb(var(--grayscale-60) / <alpha-value>)',
        'input-ico': { primary: 'rgb(var(--grayscale-80) / <alpha-value>)' },
        'btn-txt-primary': {
          default: 'rgb(var(--grayscale-00) / <alpha-value>)',
          disabled: 'rgb(var(--grayscale-40) / <alpha-value>)',
        },
        'btn-bg-secondary': {
          disabled: 'rgb(var(--grayscale-20) / <alpha-value>)',
          default: 'rgb(var(--grayscale-20) / <alpha-value>)',
        },
        'btn-txt-secondary': {
          disabled: 'rgb(var(--grayscale-40) / <alpha-value>)',
          default: 'rgb(var(--grayscale-80) / <alpha-value>)',
        },
        'content-area-txt': 'rgb(var(--grayscale-80) / <alpha-value>)',
        'btn-ico-side-bar-item': 'rgb(var(--grayscale-80) / <alpha-value>)',
        'btn-bg-primary': {
          disabled: 'rgb(var(--grayscale-20) / <alpha-value>)',
          default: 'rgb(var(--primary-50) / <alpha-value>)',
        },
        logo: {
          primary: 'rgb(var(--grayscale-80) / <alpha-value>)',
          secondary: 'rgb(var(--grayscale-00) / <alpha-value>)',
        },
        'welcome-border': 'rgb(var(--grayscale-20) / <alpha-value>)',
        'editor-selection': 'rgb(196 220 246 / <alpha-value>)',
        'radio-active': 'rgb(--primary-50 / <alpha-value>)',
        'empty-state-ico-empty': 'rgb(var(--grayscale-40) / <alpha-value>)',
        'pop-up-message': {
          txt: 'rgb(var(--grayscale-00) / <alpha-value>)',
          bg: 'rgb(var(--grayscale-80) / <alpha-value>)',
        },
      },
      boxShadow: {
        default: '0px 0px 24px 0px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        default: '0.25rem',
        modal: '0.5rem',
      },
      transitionProperty: {
        position: 'top, left, bottom, right',
      },
      fontFamily: {
        default: ['"Roboto", sans-serif'],
      },
      zIndex: {
        modals: 99999,
        notifications: 88888,
        'drop-zone': 55555,
        tooltip: 44444,
        'resize-handle': 33333,
        dropdown: 22222,
        sidebar: 11,
        'sidebar-panel': 10,
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
