import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      /* ── Stitch Fonts ── */
      fontFamily: {
        sans:    ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Montserrat"', "system-ui", "sans-serif"],
        mono:    ['"Inter"', "monospace"],
        /* Keep legacy names */
        headline: ['"Montserrat"', "system-ui", "sans-serif"],
        body:     ['"Inter"', "system-ui", "sans-serif"],
      },

      /* ── Stitch Color Tokens ── */
      colors: {
        border:  "hsl(var(--border))",
        input:   "hsl(var(--input))",
        ring:    "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT:    "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT:    "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        sidebar: {
          DEFAULT:              "hsl(var(--sidebar-background))",
          foreground:           "hsl(var(--sidebar-foreground))",
          primary:              "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent:               "hsl(var(--sidebar-accent))",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground))",
          border:               "hsl(var(--sidebar-border))",
          ring:                 "hsl(var(--sidebar-ring))",
        },

        /* ── Raw Stitch palette (used in Tailwind classes like bg-navy-900) ── */
        navy: {
          950: "#010e24",
          900: "#041329",
          800: "#0d1c32",
          700: "#112036",
          600: "#1c2a41",
          500: "#27354c",
          400: "#2c3951",
        },
        cyan: {
          glow:  "#00daf3",
          DEFAULT: "#00e5ff",
          light:  "#c3f5ff",
          fixed:  "#9cf0ff",
        },
        "stitch-blue": {
          DEFAULT: "#0068ed",
          container: "#b0c6ff",
        },
        "stitch-green": {
          DEFAULT: "#22ef7e",
          light:   "#b1ffbf",
          fixed:   "#62ff96",
        },
        "stitch-error": "#ffb4ab",
        "on-surface":         "#d6e3ff",
        "on-surface-variant": "#bac9cc",
        "surface-variant":    "#27354c",
        "outline-variant":    "#3b494c",

        /* The Verge compatibility */
        verge: {
          mint:              "#00e5ff",
          "mint-dark":       "#00daf3",
          ultraviolet:       "#0068ed",
          "ultraviolet-dark":"#004fad",
          black:             "#041329",
          slate:             "#112036",
          "slate-light":     "#1c2a41",
          white:             "#d6e3ff",
          gray:              "#849396",
        },
      },

      /* ── Border radius (Stitch scale) ── */
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm:  "0.375rem",
        md:  "0.625rem",
        lg:  "0.75rem",
        xl:  "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      /* ── Keyframes ── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          from: { boxShadow: "0 0 12px rgba(0, 218, 243, 0.15)" },
          to:   { boxShadow: "0 0 28px rgba(0, 218, 243, 0.35)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-live": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.6", transform: "scale(0.85)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        float:        "float 6s ease-in-out infinite",
        glow:         "glow-pulse 3s ease-in-out infinite alternate",
        "fade-up":    "fade-up 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "slide-in":   "slide-in 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "pulse-live": "pulse-live 2s ease-in-out infinite",
      },

      /* ── Box shadows ── */
      boxShadow: {
        "glow-sm":  "0 0 10px rgba(0, 218, 243, 0.15)",
        "glow-md":  "0 0 20px rgba(0, 218, 243, 0.2)",
        "glow-lg":  "0 0 40px rgba(0, 218, 243, 0.25)",
        "glass-inset": "inset 0 1px 0 rgba(255,255,255,0.08)",
        "bottom-nav": "0 -4px 24px rgba(0, 218, 243, 0.06)",
      },

      /* ── Backdrop blur ── */
      backdropBlur: {
        glass: "20px",
        "glass-lg": "32px",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
