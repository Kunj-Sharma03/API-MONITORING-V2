
import { Inter, JetBrains_Mono, Sora, Nunito_Sans, Orbitron, Electrolize } from "next/font/google";
import "./globals.css";

// 🚀 Custom Direction font (will be loaded via CSS @font-face)
// No need to import as it's a custom font

// Retro-futuristic primary font
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700", "800", "900"],
});

// Cyberpunk secondary font
const electrolize = Electrolize({
  variable: "--font-electrolize",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "API Monitoring Dashboard",
  description: "Monitor your APIs with real-time alerts and comprehensive analytics",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preload" href="/fonts/Direction-R9e63.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      <body
        className={`font-sans antialiased ${orbitron.variable} ${electrolize.variable} ${inter.variable} ${sora.variable} ${jetbrainsMono.variable} ${nunitoSans.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
