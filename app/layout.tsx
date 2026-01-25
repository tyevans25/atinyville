import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ATEEZ Streaming Hub",
  description: "Test your ATEEZ knowledge while streaming!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#000000",
          colorInputBackground: "rgba(255, 255, 255, 0.1)",
          colorInputText: "#ffffff",
        },
        elements: {
          formButtonPrimary:
            "bg-white hover:bg-gray-200 text-gray-800",
          card:
            "bg-white/10 backdrop-blur-xl border-white/20",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-300",
          socialButtonsBlockButton:
            "bg-white/10 border-white/20 text-white hover:bg-white/20",
          formFieldLabel: "text-gray-300",
          formFieldInput:
            "bg-white/10 border-white/20 text-white",
          footerActionLink:
            "text-blue-400 hover:text-blue-300",
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
