import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Your Name - 3D Interactive Portfolio',
  description: 'Full-stack developer crafting immersive digital experiences',
  keywords: 'web developer, frontend, backend, 3D, WebGL, Three.js, React, Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-black">
        {children}
      </body>
    </html>
  )
}
