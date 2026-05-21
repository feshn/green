import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
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
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Evolventa: display headings per Figma; swap to local @font-face in E1 if needed */}
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/evolventa"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={
          {
            ["--font-evolventa" as string]:
              '"Evolventa", var(--font-inter), sans-serif',
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  )
}
