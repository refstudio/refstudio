import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        "base": ["14px", "20px"],
        // TipTap Editor styles
        "editor-h1": ["32px", "36px"],
        "editor-h2": ["24px", "32px"],
        "editor-h3": ["20px", "28px"],
        "editor-h4": ["18px", "24px"],
        "editor-h5": ["16px", "22px"],
        "editor-base": ["16px", "20px"],
      },
      colors: {
        'txt': {
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        'resizer-bg': {
          hover: 'rgb(var(--resizer-bg-hover) / <alpha-value>)',
          default: 'rgb(var(--resizer-bg-default) / <alpha-value>)',
        },
        'btn-ico-modal-item': {
          active: 'rgb(var(--btn-ico-modal-item-active) / <alpha-value>)',
          hover: 'rgb(var(--btn-ico-modal-item-hover) / <alpha-value>)',
          default: 'rgb(var(--btn-ico-modal-item-default) / <alpha-value>)',
        },
        'btn-txt-modal-item': {
          hover: 'rgb(var(--btn-txt-modal-item-hover) / <alpha-value>)',
          active: 'rgb(var(--btn-txt-modal-item-active) / <alpha-value>)',
          default: 'rgb(var(--btn-txt-modal-item-default) / <alpha-value>)',
        },
        'modal-ico-placeholder': 'rgb(var(--modal-ico-placeholder) / <alpha-value>)',
        'modal-txt-placeholder': 'rgb(var(--modal-txt-placeholder) / <alpha-value>)',
        'modal-border': 'rgb(var(--modal-border) / <alpha-value>)',
        'modal-txt': {
          secondary: 'rgb(var(--modal-txt-secondary) / <alpha-value>)',
          primary: 'rgb(var(--modal-txt-primary) / <alpha-value>)',
        },
        'modal-bg': {
          secondary: 'rgb(var(--modal-bg-secondary) / <alpha-value>)',
          primary: 'rgb(var(--modal-bg-primary) / <alpha-value>)',
          overlay: 'rgb(var(--modal-bg-overlay) / <alpha-value>)',
        },
        'card-txt': {
          tertiary: 'rgb(var(--card-txt-tertiary) / <alpha-value>)',
          secondary: 'rgb(var(--card-txt-secondary) / <alpha-value>)',
          primary: 'rgb(var(--card-txt-primary) / <alpha-value>)',
        },
        'card-ico': {
          primary: 'rgb(var(--card-ico-primary) / <alpha-value>)',
        },
        'card-ico-header': {
          active: 'rgb(var(--card-ico-header-active) / <alpha-value>)',
        },
        'input-txt': {
          disabled: 'rgb(var(--input-txt-disabled) / <alpha-value>)',
          secondary: 'rgb(var(--input-txt-secondary) / <alpha-value>)',
          primary: 'rgb(var(--input-txt-primary) / <alpha-value>)',
        },
        'btn-bg-side-bar-icon': {
          hover: 'rgb(var(--btn-bg-side-bar-icon-hover) / <alpha-value>)',
          default: 'rgb(var(--btn-bg-side-bar-icon-default) / <alpha-value>)',
        },
        'btn-bg-info-pop-up': 'rgb(var(--btn-bg-info-pop-up) / <alpha-value>)',
        'btn-bg-radio': {
          active: 'rgb(var(--btn-bg-radio-active) / <alpha-value>)',
        },
        'btn-ico-side-bar-tool': {
          disabled: 'rgb(var(--btn-ico-side-bar-tool-disabled) / <alpha-value>)',
          hover: 'rgb(var(--btn-ico-side-bar-tool-hover) / <alpha-value>)',
          default: 'rgb(var(--btn-ico-side-bar-tool-default) / <alpha-value>)',
          active: 'rgb(var(--btn-ico-side-bar-tool-active) / <alpha-value>)',
        },
        'btn-ico-tool': {
          disabled: 'rgb(var(--btn-ico-tool-disabled) / <alpha-value>)',
          default: 'rgb(var(--btn-ico-tool-default) / <alpha-value>)',
          hover: 'rgb(var(--btn-ico-tool-hover) / <alpha-value>)',
          active: 'rgb(var(--btn-ico-tool-active) / <alpha-value>)',
        },
        'btn-bg-tool': {
          active: 'rgb(var(--btn-bg-tool-active) / <alpha-value>)',
          disabled: 'rgb(var(--btn-bg-tool-disabled) / <alpha-value>)',
          hover: 'rgb(var(--btn-bg-tool-hover) / <alpha-value>)',
          default: 'rgb(var(--btn-bg-tool-default) / <alpha-value>)',
        },
        'content-area-border': 'rgb(var(--content-area-border) / <alpha-value>)',
        'status-bar-txt': 'rgb(var(--status-bar-txt) / <alpha-value>)',
        'btn-bg-side-bar-tool': {
          active: 'rgb(var(--btn-bg-side-bar-tool-active) / <alpha-value>)',
          disabled: 'rgb(var(--btn-bg-side-bar-tool-disabled) / <alpha-value>)',
          default: 'rgb(var(--btn-bg-side-bar-tool-default) / <alpha-value>)',
          hover: 'rgb(var(--btn-bg-side-bar-tool-hover) / <alpha-value>)',
        },
        'btn-txt-side-bar-item': {
          primary: 'rgb(var(--btn-txt-side-bar-item-primary) / <alpha-value>)',
        },
        'btn-bg-side-bar-item': {
          active: 'rgb(var(--btn-bg-side-bar-item-active) / <alpha-value>)',
          hover: 'rgb(var(--btn-bg-side-bar-item-hover) / <alpha-value>)',
          default: 'rgb(var(--btn-bg-side-bar-item-default) / <alpha-value>)',
        },
        'btn-bg-top-bar': {
          inactive: 'rgb(var(--btn-bg-top-bar-inactive) / <alpha-value>)',
          active: 'rgb(var(--btn-bg-top-bar-active) / <alpha-value>)',
        },
        'btn-ico-content': 'rgb(var(--btn-ico-content) / <alpha-value>)',
        'btn-ico-side-bar-icon': {
          hover: 'rgb(var(--btn-ico-side-bar-icon-hover) / <alpha-value>)',
          default: 'rgb(var(--btn-ico-side-bar-icon-default) / <alpha-value>)',
          disabled: 'rgb(var(--btn-ico-side-bar-icon-disabled) / <alpha-value>)',
        },
        'btn-ico-side-bar-dots-icon': {
          hover: 'rgb(var(--btn-ico-side-bar-dots-icon-hover) / <alpha-value>)',
        },
        'input-border': {
          active: 'rgb(var(--input-border-active) / <alpha-value>)',
          disabled: 'rgb(var(--input-border-disabled) / <alpha-value>)',
          default: 'rgb(var(--input-border-default) / <alpha-value>)',
          error: 'rgb(var(--input-border-error) / <alpha-value>)',
        },
        'input-bg': {
          disabled: 'rgb(var(--input-bg-disabled) / <alpha-value>)',
          default: 'rgb(var(--input-bg-default) / <alpha-value>)',
        },
        'status-bar-border': 'rgb(var(--status-bar-border) / <alpha-value>)',
        'btn-ico-top-bar': {
          inactive: 'rgb(var(--btn-ico-top-bar-inactive) / <alpha-value>)',
          active: 'rgb(var(--btn-ico-top-bar-active) / <alpha-value>)',
        },
        'btn-txt-top-bar': {
          inactive: 'rgb(var(--btn-txt-top-bar-inactive) / <alpha-value>)',
          active: 'rgb(var(--btn-txt-top-bar-active) / <alpha-value>)',
        },
        'top-bar-bg': {
          active: 'rgb(var(--top-bar-bg-active) / <alpha-value>)',
          inactive: 'rgb(var(--top-bar-bg-inactive) / <alpha-value>)',
        },
        'top-bar-border': 'rgb(var(--top-bar-border) / <alpha-value>)',
        'content-area-bg': {
          primary: 'rgb(var(--content-area-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--content-area-bg-secondary) / <alpha-value>)',
        },
        'side-bar-txt': {
          primary: 'rgb(var(--side-bar-txt-primary) / <alpha-value>)',
          secondary: 'rgb(var(--side-bar-txt-secondary) / <alpha-value>)',
        },
        'side-bar-border': 'rgb(var(--side-bar-border) / <alpha-value>)',
        'side-bar-bg': {
          primary: 'rgb(var(--side-bar-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--side-bar-bg-secondary) / <alpha-value>)',
        },
        'side-bar-ico': {
          empty: 'rgb(var(--side-bar-ico-empty) / <alpha-value>)',
          default: 'rgb(var(--side-bar-ico-default) / <alpha-value>)',
        },
        'card-txt-header': 'rgb(var(--card-txt-header) / <alpha-value>)',
        'card-border-header': 'rgb(var(--card-border-header) / <alpha-value>)',
        'card-border': {
          secondary: 'rgb(var(--card-border-secondary) / <alpha-value>)',
          primary: 'rgb(var(--card-border-primary) / <alpha-value>)',
        },
        'status-bar-ico': 'rgb(var(--status-bar-ico) / <alpha-value>)',
        'btn-ico-primary': {
          default: 'rgb(var(--btn-ico-primary-default) / <alpha-value>)',
          disabled: 'rgb(var(--btn-ico-primary-disabled) / <alpha-value>)',
        },
        'input-bg-action': 'rgb(var(--input-bg-action) / <alpha-value>)',
        'btn-bg-modal-item': {
          default: 'rgb(var(--btn-bg-modal-item-default) / <alpha-value>)',
          hover: 'rgb(var(--btn-bg-modal-item-hover) / <alpha-value>)',
        },
        'card-bg-header': 'rgb(var(--card-bg-header) / <alpha-value>)',
        'card-bg': {
          secondary: 'rgb(var(--card-bg-secondary) / <alpha-value>)',
          primary: 'rgb(var(--card-bg-primary) / <alpha-value>)',
        },
        'status-bar-bg': 'rgb(var(--status-bar-bg) / <alpha-value>)',
        'input-txt-placeholder': 'rgb(var(--input-txt-placeholder) / <alpha-value>)',
        'btn-ico-secondary': {
          default: 'rgb(var(--btn-ico-secondary-default) / <alpha-value>)',
          disabled: 'rgb(var(--btn-ico-secondary-disabled) / <alpha-value>)',
        },
        'input-ico-placeholder': 'rgb(var(--input-ico-placeholder) / <alpha-value>)',
        'input-ico': {
          primary: 'rgb(var(--input-ico-primary) / <alpha-value>)',
        },
        'btn-txt-primary': {
          default: 'rgb(var(--btn-txt-primary-default) / <alpha-value>)',
          disabled: 'rgb(var(--btn-txt-primary-disabled) / <alpha-value>)',
        },
        'btn-bg-secondary': {
          disabled: 'rgb(var(--btn-bg-secondary-disabled) / <alpha-value>)',
          default: 'rgb(var(--btn-bg-secondary-default) / <alpha-value>)',
        },
        'btn-txt-secondary': {
          disabled: 'rgb(var(--btn-txt-secondary-disabled) / <alpha-value>)',
          default: 'rgb(var(--btn-txt-secondary-default) / <alpha-value>)',
        },
        'content-area-txt': 'rgb(var(--content-area-txt) / <alpha-value>)',
        'btn-ico-side-bar-item': 'rgb(var(--btn-ico-side-bar-item) / <alpha-value>)',
        'btn-bg-primary': {
          disabled: 'rgb(var(--btn-bg-primary-disabled) / <alpha-value>)',
          default: 'rgb(var(--btn-bg-primary-default) / <alpha-value>)',
        },
        logo: {
          primary: 'rgb(var(--logo-primary) / <alpha-value>)',
          secondary: 'rgb(var(--logo-secondary) / <alpha-value>)',
        },
        'welcome-border': 'rgb(var(--welcome-border) / <alpha-value>)',
        'editor-selection': 'rgb(var(--editor-selection) / <alpha-value>)',
        'radio-active': 'rgb(var(--radio-active) / <alpha-value>)',
        'radio-border-inactive': 'rgb(var(--radio-border-inactive) / <alpha-value>)',
        'pop-up-message': {
          txt: 'rgb(var(--pop-up-message-txt) / <alpha-value>)',
          bg: 'rgb(var(--pop-up-message-bg) / <alpha-value>)',
        },
      },
      backgroundOpacity: {
        overlay: '0.32',
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
        tooltip: 'opacity, visibility',
      },
      fontFamily: {
        default: ['"Roboto", sans-serif'],
      },
      zIndex: {
        modals: 999999,
        notifications: 888888,
        'drop-zone': 555555,
        tooltip: 444444,
        'resize-handle': 333333,
        dropdown: 222222,
        'sidebar-panel': 151515,
        sidebar: 111111,
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
