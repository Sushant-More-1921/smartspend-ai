import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import NavigationProgress from "@/components/NavigationProgress";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "SmartSpend AI",
  description: "One stop Finance Platform",
  icons: {
    icon: "/logo-sm-white.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo-sm-white.png" sizes="any" />
          <link rel="shortcut icon" href="/logo-sm-white.png" />
          <link rel="apple-touch-icon" href="/logo-sm-white.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className={`${inter.className}`}>
          <NavigationProgress />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>  
  );
}
