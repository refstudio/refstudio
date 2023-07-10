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
          hover: 'hsl(var(--color-primary-hover) / <alpha-value>)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary) / <alpha-value>)',
          hover: 'hsl(var(--color-secondary-hover) / <alpha-value>)'
        }
      },
      zIndex: {
        "modals":        99999,
        'notifications': 88888,
        'drop-zone':     55555,
      }
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
      '.debug-widget': {}
    })
  })
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
