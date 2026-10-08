/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme palette matching BookWorm design
        'bw-bg':      '#1a1a1a',
        'bw-surface': '#242424',
        'bw-card':    '#2a2a2a',
        'bw-hover':   '#333333',
        'bw-border':  '#3a3a3a',
        'bw-muted':   '#888888',
        'bw-subtle':  '#666666',
        'bw-dim':     '#555555',
        'bw-text':    '#cccccc',
        'bw-faint':   '#aaaaaa',
      },
      fontSize: {
        '2xs': ['9px', { lineHeight: '1' }],
        '3xs': ['7px', { lineHeight: '1.2' }],
      },
      width: {
        sidebar: '200px',
      },
      minWidth: {
        sidebar: '200px',
      },
    },
  },
  plugins: [],
};
