/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./static/**/*.{html,js,ejs}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
}