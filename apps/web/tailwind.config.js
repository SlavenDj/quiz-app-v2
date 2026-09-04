/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          nav: "#AD45D1",
          quiz: "#835B92",
          auth: "#955CA6",
          muted: "#B08BBE",
        },
        status: {
          locked: "#9CA3AF",
          progress: "#F59E0B",
          success: "#16A34A",
          danger: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        card: "0.75rem",
      },
      boxShadow: {
        card: "0 1px 3px rgb(0 0 0 / 0.08), 0 4px 12px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};
