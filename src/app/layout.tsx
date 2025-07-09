'use client';

import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppProvider, useAppContext } from '@/contexts/AuthContext';
import { Dog } from 'lucide-react';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading, pets, petsLoading } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = ['/login', '/signup'].includes(pathname);

  useEffect(() => {
    const isReady = !loading && !petsLoading;
    if (!isReady) {
      return; 
    }
    if (!user && !isPublicPage) {
      router.push('/login');
    }
    if (user && isPublicPage) {
      router.push('/');
    }
    if (user && pets.length === 0 && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [user, loading, pets, petsLoading, isPublicPage, pathname, router]);


  if (loading || petsLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Dog className="h-16 w-16 text-primary animate-bounce" />
      </div>
    );
  }

  if (isPublicPage || !user) {
     return <>{children}</>;
  }
  
  // Don't render protected pages if there are no pets and we are about to redirect
  if (pets.length === 0 && pathname !== '/onboarding') {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Dog className="h-16 w-16 text-primary animate-bounce" />
      </div>
    );
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
        <AppProvider>
          <AppContent>
            {children}
          </AppContent>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
