import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import { WebVitalsScript } from "@/components/WebVitalsScript";
import { SocketProviders } from "@/components/listeners/SocketProviders";
import { ServiceWorkerRegister } from "@/components/push/ServiceWorkerRegister";
import { ErrorBoundary } from "@/components/ui/error-boundary";


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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get('theme')?.value;
  const initialDark = cookieTheme === 'dark';

  return (
    <html lang="ru" className={initialDark ? 'dark' : undefined} suppressHydrationWarning>
      <head>
        <style>{`
          html, body { background-color: #f5f5f7; }
          @media (prefers-color-scheme: dark) {
            html, body { background-color: #111113; }
          }
        `}</style>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css"
          rel="stylesheet"
          media="print"
          // @ts-expect-error onLoad sets media to all for async CSS loading
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css"
            rel="stylesheet"
          />
        </noscript>
        {/* Inline script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var cookieMatch = document.cookie.match(/(?:^|; )theme=([^;]+)/);
                  var cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
                  var stored = localStorage.getItem('design-storage');
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var root = document.documentElement;
                  var setThemePaint = function(isDark) {
                    root.style.backgroundColor = isDark ? '#111113' : '#f5f5f7';
                    root.style.colorScheme = isDark ? 'dark' : 'light';
                    if (document.body) {
                      document.body.style.backgroundColor = isDark ? '#111113' : '#f5f5f7';
                    }
                  };
                  if (cookieTheme === 'dark') {
                    root.classList.add('dark');
                    setThemePaint(true);
                  } else if (cookieTheme === 'light') {
                    root.classList.remove('dark');
                    setThemePaint(false);
                  } else if (stored) {
                    var parsed = JSON.parse(stored);
                    var state = parsed.state || parsed;
                    if (state.theme === 'dark') {
                      root.classList.add('dark');
                      setThemePaint(true);
                    } else if (state.theme === 'light') {
                      root.classList.remove('dark');
                      setThemePaint(false);
                    } else if (prefersDark) {
                      root.classList.add('dark');
                      setThemePaint(true);
                    }
                  } else if (prefersDark) {
                    root.classList.add('dark');
                    setThemePaint(true);
                  } else {
                    setThemePaint(false);
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
        <ErrorBoundary>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <SocketProviders />
              {children}
            </AuthProvider>
            <Toaster 
              position="top-right" 
              theme="system"
              richColors={false}
              toastOptions={{
                classNames: {
                  toast: 'bg-[#15181d] border-[#2a2f36] text-white shadow-[0_12px_32px_rgba(0,0,0,0.45)] rounded-2xl',
                  title: 'text-white font-semibold',
                  description: 'text-white/75',
                  success: 'bg-[#15181d] text-white',
                  error: 'bg-[#15181d] text-white',
                  warning: 'bg-[#15181d] text-white',
                  info: 'bg-[#15181d] text-white',
                },
              }}
            />
          </ThemeProvider>
        </QueryProvider>
        </ErrorBoundary>
        <WebVitalsScript />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}