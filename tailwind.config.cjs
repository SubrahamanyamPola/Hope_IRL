/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 30px rgba(56,189,248,0.35)"
      },
      backgroundImage: {
        "cloud-gradient": "radial-gradient(1200px circle at 20% 20%, rgba(56,189,248,0.25), transparent 60%), radial-gradient(1000px circle at 80% 10%, rgba(99,102,241,0.22), transparent 55%), radial-gradient(900px circle at 40% 80%, rgba(34,197,94,0.16), transparent 55%), linear-gradient(180deg, #071629 0%, #0b2b55 50%, #071629 100%)",
        "glass": "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))"
      }
    }
  },
  plugins: []
};
