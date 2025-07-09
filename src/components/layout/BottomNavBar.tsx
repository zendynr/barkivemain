'use client';

import { Home, Utensils, Footprints, Camera, Syringe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/feeding', label: 'Feeding', icon: Utensils },
  { href: '/activity', label: 'Activity', icon: Footprints },
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/memories', label: 'Memories', icon: Camera },
  { href: '/health', label: 'Health', icon: Syringe },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] md:hidden z-50">
      <div className="flex justify-around items-center h-full max-w-7xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[56px] rounded-lg p-2 text-gray-500 hover:bg-mint-green/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-green transition-colors duration-200 ease-in-out',
                {
                  'text-primary-foreground bg-mint-green': isActive,
                }
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
