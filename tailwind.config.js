const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: 'class',
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: [
    './public/**/*.html',
    './public/**/*.js',
    './src/**/*.html',
    './src/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Inter', 'monospace'],
      },
    },
  },
  variants: {
    extend: {
      borderColor: ['invalid'],
    },
  },
  plugins: [
    plugin(function addInvalidVariant({ addVariant, e }) {
      addVariant('invalid', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`invalid{separator}${className}`)}:invalid`;
        });
      });
    }),
  ],
};
