import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import { WebVitalsScript } from "@/components/WebVitalsScript";
import { SocketProviders } from "@/components/listeners/SocketProviders";
import { ServiceWorkerRegister } from "@/components/push/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LEADS CREATE",
  description: "Система управления лидами",
  icons: {
    icon: '/img/logo/favicon.png',
    apple: '/img/logo/pwa_logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LEADS CC',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FEC004' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        {/* Inline script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('design-storage');
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    var state = parsed.state || parsed;
                    if (state.theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <SocketProviders />
              {children}
            </AuthProvider>
            <Toaster 
              position="top-right" 
              theme="system"
              toastOptions={{
                classNames: {
                  toast: 'bg-white dark:bg-[#1e2736] border-gray-200 dark:border-gray-700',
                  title: 'text-gray-900 dark:text-gray-100',
                  description: 'text-gray-500 dark:text-gray-400',
                  success: 'bg-white dark:bg-[#1e2736] text-green-600 dark:text-green-400',
                  error: 'bg-white dark:bg-[#1e2736] text-red-600 dark:text-red-400',
                  warning: 'bg-white dark:bg-[#1e2736] text-yellow-600 dark:text-yellow-400',
                  info: 'bg-white dark:bg-[#1e2736] text-blue-600 dark:text-blue-400',
                },
              }}
            />
          </ThemeProvider>
        </QueryProvider>
        <WebVitalsScript />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}