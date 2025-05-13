/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./app/*.{js,jsx,ts,tsx}", "./app/index.jsx",
            "./components/**/*.{js,jsx,ts,tsx}", "./components/*.{js,jsx,ts,tsx}", "./components/Splashscreen.js"
  ],
  theme: {
    extend: {
      // colors: {
      //   primary: '#1F41BB',
      //   secondary: '#007AFF',
      // },
    },
  },
  plugins: [],
}

