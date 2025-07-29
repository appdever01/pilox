import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{ts,tsx}",
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
  		animation: {
  			blob: "blob 7s infinite",
  		},
  		keyframes: {
  			blob: {
  				"0%": {
  					transform: "translate(0px, 0px) scale(1)",
  				},
  				"33%": {
  					transform: "translate(30px, -50px) scale(1.1)",
  				},
  				"66%": {
  					transform: "translate(-20px, 20px) scale(0.9)",
  				},
  				"100%": {
  					transform: "translate(0px, 0px) scale(1)",
  				},
  			},
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: '#2563eb',
  				hover: '#1d4ed8',
          dark: '#1e40af',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: '#3b82f6',
  				light: '#60a5fa',
  				dark: '#1d4ed8',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
        tertiary: {
          DEFAULT: '#ff5555',
          dark: '#2563eb',
          foreground: 'hsl(var(--tertiary-foreground))'
        },
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: '#dbeafe80',
  				green: '#2563eb',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
	require("tailwindcss-animate"),
	require('tailwind-scrollbar')({ nocompatible: true }),
  ],
} satisfies Config;

export default config;
