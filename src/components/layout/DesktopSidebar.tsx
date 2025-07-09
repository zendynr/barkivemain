'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Home, Utensils, Footprints, Camera, Syringe, Dog, LogOut } from 'lucide-react';
import { signOutUser } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';


const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/feeding', label: 'Feeding', icon: Utensils },
  { href: '/activity', label: 'Activity', icon: Footprints },
  { href: '/memories', label: 'Memories', icon: Camera },
  { href: '/health', label: 'Health', icon: Syringe },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({ title: 'Signed out successfully.' });
      router.push('/login');
    } catch (error) {
      console.error('Sign out error', error);
      toast({ variant: 'destructive', title: 'Failed to sign out.' });
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="bg-mint-green p-2 rounded-lg">
                <Dog className="text-primary-foreground" />
            </div>
            <h1 className="font-headline text-xl font-bold">Barkive</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarSeparator />
         <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} tooltip={{ children: 'Sign Out' }}>
                  <LogOut />
                  <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
         <SidebarSeparator />
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
