// import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NetworkProvider } from "@/lib/network/NetworkContext";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
// Load Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compensate",
  description:
    "Compensate your cross-chain workforce with ease and transparency",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          <NetworkProvider>
            {children}
            <Toaster />
          </NetworkProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
