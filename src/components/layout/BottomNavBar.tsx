'use client';

import { Home, Utensils, Footprints, Camera, Syringe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { id: 'feeding', label: 'Feeding', icon: Utensils },
  { id: 'activity', label: 'Activity', icon: Footprints },
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'memories', label: 'Memories', icon: Camera },
  { id: 'health', label: 'Health', icon: Syringe },
];

export function BottomNavBar() {
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
        rootMargin: '0px 0px -85% 0px',
        threshold: 0,
      }
    );

    sectionElements.forEach((section) => observer.observe(section));

    return () => {
      sectionElements.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] md:hidden z-50">
      <div className="flex justify-around items-center h-full max-w-7xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.label}
              onClick={() => handleScroll(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[56px] rounded-lg p-2 text-gray-500 hover:bg-mint-green/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-green transition-colors duration-200 ease-in-out',
                {
                  'text-primary-foreground bg-mint-green': isActive,
                }
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
