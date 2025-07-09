'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Home, Utensils, Footprints, Camera, Syringe, Dog } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'feeding', label: 'Feeding', icon: Utensils },
  { id: 'activity', label: 'Activity', icon: Footprints },
  { id: 'memories', label: 'Memories', icon: Camera },
  { id: 'health', label: 'Health', icon: Syringe },
];

export function DesktopSidebar() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };
  
  useEffect(() => {
    const sectionElements = navItems
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -70% 0px', // A section is active if it's in the top 30% of the viewport
        threshold: 0,
      }
    );

    sectionElements.forEach((section) => observer.observe(section));

    return () => {
      sectionElements.forEach((section) => observer.unobserve(section));
    };
  }, []);

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
            const isActive = activeSection === item.id;
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  onClick={() => handleScroll(item.id)}
                  isActive={isActive}
                  tooltip={{ children: item.label }}
                >
                  <Icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
