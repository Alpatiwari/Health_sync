/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
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
        // Add base colors required by shadcn/ui if using it
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Your existing color palettes
        primary: {
          DEFAULT: "hsl(var(--primary))",
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... rest of your primary palette
        },
        
        // Secondary color palette
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          50: '#f8fafc',
          // ... rest of your secondary palette
        },

        // Health-specific colors
        health: {
          dark: '#0f172a',
          // ... rest of health colors
        },

        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      
      // Rest of your configuration remains the same
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // ... rest of font families
      },
      
      // ... rest of your theme extensions
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
}