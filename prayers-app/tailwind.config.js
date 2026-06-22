/** @type {import('tailwindcss').Config} */
// מקור האמת לצבעי המותג "אנו בנייך" — theme/colors.json (משותף עם constants/theme.ts)
const colors = require('./theme/colors.json');

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
