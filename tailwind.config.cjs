const pluginList = [];
try {
  pluginList.push(require('@tailwindcss/typography'));
} catch (e) {
  // Optional: @tailwindcss/typography not installed yet.
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,svelte,md}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        "on-tertiary": "#ffffff",
        "secondary-fixed": "#e3e3de",
        "on-secondary": "#ffffff",
        "tertiary-fixed-dim": "#92ccff",
        "warm-silver": "#91918c",
        "warm-wash": "hsla(60, 20%, 98%, 0.5)",
        "surface-container-highest": "#fedad7",
        "warm-light": "#e0e0d9",
        "on-primary-fixed": "#410004",
        "on-primary-container": "#fff7f6",
        "error-red": "#9e0a0a",
        "surface-container-lowest": "#ffffff",
        "secondary-fixed-dim": "#c6c7c2",
        "inverse-primary": "#ffb3ad",
        "on-primary-fixed-variant": "#930012",
        "olive-gray": "#62625b",
        "tertiary": "#005f90",
        "on-surface": "#2a1615",
        "inverse-on-surface": "#ffedeb",
        "surface-dim": "#f5d2cf",
        "surface-container": "#ffe9e7",
        "primary-fixed": "#ffdad7",
        "plum-black": "#211922",
        "on-background": "#2a1615",
        "focus-blue": "#435ee5",
        "tertiary-fixed": "#cce5ff",
        "on-tertiary-fixed": "#001e31",
        "surface": "#fff8f7",
        "on-secondary-fixed-variant": "#464744",
        "secondary": "#5d5f5b",
        "tertiary-container": "#0079b6",
        "on-error-container": "#93000a",
        "on-tertiary-fixed-variant": "#004b73",
        "outline": "#936e6b",
        "fog": "#f6f6f3",
        "primary-container": "#e60023",
        "outline-variant": "#e8bcb8",
        "inverse-surface": "#412b29",
        "on-tertiary-container": "#f7f9ff",
        "on-secondary-container": "#62635f",
        "surface-variant": "#fedad7",
        "on-secondary-fixed": "#1a1c19",
        "surface-bright": "#fff8f7",
        "surface-container-high": "#ffe2df",
        "primary": "#b7001a",
        "on-surface-variant": "#5e3f3c",
        "error-container": "#ffdad6",
        "primary-fixed-dim": "#ffb3ad",
        "dark-surface": "#33332e",
        "secondary-container": "#e0e0db",
        "error": "#ba1a1a",
        "surface-tint": "#c0001b",
        "on-error": "#ffffff",
        "brand-red": "#e60023",
        "surface-container-low": "#fff0ef",
        "on-primary": "#ffffff",
        "sand-gray": "#e5e5e0",
        "success-green": "#103c25",
        "background": "#fff8f7"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "sm": "8px",
        "md": "16px",
        "unit": "8px",
        "xl": "32px",
        "hero": "100px",
        "xs": "4px",
        "section": "80px",
        "lg": "24px"
      },
      fontFamily: {
        "body": ["Plus Jakarta Sans", "sans-serif"],
        "display-hero": ["Plus Jakarta Sans", "sans-serif"],
        "caption": ["Plus Jakarta Sans", "sans-serif"],
        "caption-bold": ["Plus Jakarta Sans", "sans-serif"],
        "label-compact": ["Plus Jakarta Sans", "sans-serif"],
        "section-heading": ["Plus Jakarta Sans", "sans-serif"]
      },
      fontSize: {
        "body": ["16px", { lineHeight: "1.4", letterSpacing: "normal", fontWeight: "400" }],
        "display-hero": ["70px", { lineHeight: "1.1", letterSpacing: "normal", fontWeight: "600" }],
        "caption": ["12px", { lineHeight: "1.5", letterSpacing: "normal", fontWeight: "400" }],
        "caption-bold": ["14px", { lineHeight: "1.5", letterSpacing: "normal", fontWeight: "700" }],
        "label-compact": ["12px", { lineHeight: "1", letterSpacing: "normal", fontWeight: "500" }],
        "section-heading": ["28px", { lineHeight: "1.2", letterSpacing: "-1.2px", fontWeight: "700" }]
      }
    }
  },
  plugins: pluginList,
};
