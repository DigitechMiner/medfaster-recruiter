import clsx from "clsx"
import localFont from "next/font/local"

const main = localFont({
  variable: "--font-main",
  display: "swap",
  preload: true,
  src: [
    {
      path: "../public/fonts/inter/InterVariable.woff2",
      style: "normal",
      weight: "100 900"
    },
    {
      path: "../public/fonts/inter/InterVariable-Italic.woff2",
      style: "italic",
      weight: "100 900"
    }
  ],
  fallback: ["system-ui", "Arial"]
})

export const fonts = clsx(main.variable)
