console.log('tailwind loaded config');
module.exports = {
  darkMode: 'class',
  content: [
    './public/**/*.html',
    './public/**/*.js',
    './src/web/**/*.html',
    './src/web/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  variants: {},
  plugins: [],
};
