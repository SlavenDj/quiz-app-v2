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
      },
    },
  },
  plugins: [],
};
