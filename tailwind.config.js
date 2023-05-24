import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#58c380",
          hover: "#1C9358"
        },
        secondary: {
          DEFAULT: "#88D9E6",
          hover: "#46C4D8"
        }
      }
    },
  },
  plugins: [debugPlugin()],
};

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
