import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"

import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
})

const evolventa = localFont({
  src: [
    {
      path: "../public/fonts/evolventa/Evolventa-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/evolventa/Evolventa-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-evolventa",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Green Pharmacy",
  description: "Веб-аптека с самовывозом — Green",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${evolventa.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
