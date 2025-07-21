import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Matrix IDE dark vermeil theme colors
        matrix: {
          dark: "hsl(var(--matrix-dark))",
          purple: {
            50: "hsl(var(--matrix-purple-50))",
            100: "hsl(var(--matrix-purple-100))",
            200: "hsl(var(--matrix-purple-200))",
            300: "hsl(var(--matrix-purple-300))",
            400: "hsl(var(--matrix-purple-400))",
            500: "hsl(var(--matrix-purple-500))",
            600: "hsl(var(--matrix-purple-600))",
            700: "hsl(var(--matrix-purple-700))",
            800: "hsl(var(--matrix-purple-800))",
            900: "hsl(var(--matrix-purple-900))",
          },
          gold: {
            50: "hsl(var(--matrix-gold-50))",
            100: "hsl(var(--matrix-gold-100))",
            200: "hsl(var(--matrix-gold-200))",
            300: "hsl(var(--matrix-gold-300))",
            400: "hsl(var(--matrix-gold-400))",
            500: "hsl(var(--matrix-gold-500))",
            600: "hsl(var(--matrix-gold-600))",
            700: "hsl(var(--matrix-gold-700))",
            800: "hsl(var(--matrix-gold-800))",
            900: "hsl(var(--matrix-gold-900))",
          },
          glass: "hsl(var(--matrix-glass))",
          glow: "hsl(var(--matrix-glow))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
