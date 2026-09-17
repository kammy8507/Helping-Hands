/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Roboto Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        /* Government / medical green — the primary brand.
           Tailwind's `emerald` scale is remapped here so every existing
           `emerald-*` class across the app becomes the official green with
           zero component edits. */
        emerald: {
          50: "#E7F1EC",
          100: "#D1E7DD",
          200: "#A7D3BB",
          300: "#6FB894",
          400: "#2E9B6B",
          500: "#198754", // primary
          600: "#0F5132", // dark / hover
          700: "#0F5132",
          800: "#0C4429",
          900: "#0A3A24",
          950: "#052015",
        },
        /* Emergency red — reserved for SOS, danger and HIGH severity only. */
        red: {
          50: "#FCEAEC",
          100: "#F8D7DA",
          200: "#F1AEB5",
          300: "#EA868F",
          400: "#E35D6A",
          500: "#DC3545",
          600: "#DC3545",
          700: "#B02A37",
          800: "#842029",
          900: "#6A1A21",
          950: "#4A1216",
        },
        /* Named brand aliases for new code. */
        brand: {
          DEFAULT: "#198754",
          strong: "#0F5132",
          soft: "#E7F1EC",
          softer: "#D1E7DD",
        },
        ink: "#212529",
        line: "#DEE2E6",
        canvas: "#F5F7F8",
      },
      boxShadow: {
        card: "0 1px 3px rgba(16,24,40,.08), 0 1px 2px rgba(16,24,40,.04)",
        pop: "0 12px 32px -8px rgba(16,24,40,.20)",
      },
    },
  },
  plugins: [],
};
