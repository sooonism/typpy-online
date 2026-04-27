const pluginList = [];
try {
  pluginList.push(require('@tailwindcss/typography'));
} catch (e) {
  // Optional: @tailwindcss/typography not installed yet.
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,svelte,md}', './public/**/*.html'],
  theme: {
    extend: {},
  },
  plugins: pluginList,
};
