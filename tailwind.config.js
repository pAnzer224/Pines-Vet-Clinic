/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        text: "#103826",
        primary: "#235840",
        green2: "#5B9279",
        green3: "#8FCB9B",
        background: "#FDFCFC",
        pantone: "#D1E8D5",
        red: "#EA5656",
        peach: "#FFA966",
        gold: "EDB507",
      },
      fontFamily: {
        "nunito-regular": ["Nunito-Regular"],
        "nunito-bold": ["Nunito-Bold"],
        "nunito-light": ["Nunito-Light"],
        "nunito-medium": ["Nunito-Medium"],
        "nunito-semibold": ["Nunito-SemiBold"],
      },
      boxShadow: {
        pantone: "0 2px 10px -1px #C7C8B1",
      },
    },
  },
  plugins: [require("tailwindcss-motion")],
};
