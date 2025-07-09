'use client';

import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { Dog } from 'lucide-react';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = ['/login', '/signup'].includes(pathname);

  useEffect(() => {
    if (loading) {
      return; // Don't do anything while loading
    }
    if (!user && !isPublicPage) {
      router.push('/login');
    }
    if (user && isPublicPage) {
      router.push('/');
    }
  }, [user, loading, isPublicPage, pathname, router]);


  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Dog className="h-16 w-16 text-primary animate-bounce" />
      </div>
    );
  }

  if (isPublicPage || !user) {
     return <>{children}</>;
  }

  // Authenticated user on a protected route
  const showNav = pathname !== '/onboarding';

  return (
    <>
      {showNav ? (
        <SidebarProvider>
          <DesktopSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      ) : (
        children
      )}
      {showNav && <BottomNavBar />}
    </>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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
        <AuthProvider>
          <AppContent>
            {children}
          </AppContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
