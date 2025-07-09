'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

// export const metadata: Metadata = {
//   title: 'Barkive',
//   description: 'Your personal pet dashboard',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showNav = pathname !== '/onboarding';

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>Barkive</title>
        <meta name="description" content="Your personal pet dashboard" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {showNav ? (
          <SidebarProvider>
            <DesktopSidebar />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        ) : (
          children
        )}
        {showNav && <BottomNavBar />}
        <Toaster />
      </body>
    </html>
  );
}
