/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '2rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px',
			},
		},
		extend: {
			boxShadow: {
				'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
				'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.1)',
				'mobile': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
				'mobile-lg': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
				},
				teal: {
					25: '#E3fafa',
					50: '#96a6b5',
					75: '#479dba',
					100: '#3c7f72',
				},
				gray: {
					10: '#ebebeb',
					25: '#d8d8d4',
					50: '#989494',
					100: '#686464',
					300: '#877eaf',
					400: '#686bb0',
					500: '#479aba',
					600: '#3c7f72',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'calc(var(--radius) + 4px)',
				'2xl': 'calc(var(--radius) + 8px)',
				'3xl': 'calc(var(--radius) + 12px)',
			},
			spacing: {
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-top': 'env(safe-area-inset-top)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'slide-up': {
					from: { transform: 'translateY(100%)' },
					to: { transform: 'translateY(0)' },
				},
				'slide-down': {
					from: { transform: 'translateY(-100%)' },
					to: { transform: 'translateY(0)' },
				},
				'fade-in': {
					from: { opacity: 0 },
					to: { opacity: 1 },
				},
				'scale-in': {
					from: { transform: 'scale(0.95)', opacity: 0 },
					to: { transform: 'scale(1)', opacity: 1 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-up': 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-down': 'slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in': 'fade-in 0.2s ease-in',
				'scale-in': 'scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};