import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { AppToaster } from "@/components/ui/toast";
import { EnvConfigBanner } from "@/components/layout/env-config-banner";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarivoice Admin Panel",
  description: "Premium admin console for Clarivoice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-app-bg text-app-text-primary">
        <QueryProvider>
          <AuthProvider>
            <EnvConfigBanner />
            {children}
            <AppToaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
