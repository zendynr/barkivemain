'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ActivityLog } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, Award, Forward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ActivityTracker({ activityLogs }: { activityLogs: ActivityLog[] }) {
  const [activeDays, setActiveDays] = useState<boolean[]>(Array(7).fill(false));
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);
  const [isClient, setIsClient] = useState(false);

  const weekDates = useMemo(() => {
    const today = new Date();
    const firstDay = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    firstDay.setDate(diff);
    firstDay.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      return date;
    });
  }, []);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isSameDay = (date1: Date, date2: Date) =>
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();

    const newActiveDays = weekDates.map(weekDate =>
      activityLogs.some(log => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        return isSameDay(logDate, weekDate);
      })
    );

    const todayIndex = weekDates.findIndex(date => isSameDay(date, today));
    
    setCurrentDayIndex(todayIndex > -1 ? todayIndex : (new Date().getDay() + 6) % 7);
    setActiveDays(newActiveDays);

  }, [activityLogs, weekDates]);

  const completedDays = activeDays.filter(Boolean).length;
  const streakCompleted = completedDays >= 5;

  const pawPositionStyle = useMemo(() => {
    if (!isClient || currentDayIndex === -1) {
      return { opacity: 0, left: '50%' };
    }
    const leftValue = ((currentDayIndex / 7) * 100) + (100 / 14);
    return {
      left: `${leftValue}%`,
      transform: 'translateX(-50%)',
      opacity: 1,
      transition: 'left 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s',
    };
  }, [currentDayIndex, isClient]);
  
  if (activityLogs.length === 0 && isClient) {
    return (
       <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6 text-center flex flex-col items-center justify-center gap-4 min-h-[240px]">
          <div className="w-16 h-16 rounded-full bg-mint-green/20 flex items-center justify-center">
            <PawPrint className="w-10 h-10 text-mint-green" />
          </div>
          <h3 className="font-headline text-2xl font-semibold text-gray-800">Ready for an adventure?</h3>
          <p className="text-gray-600 max-w-xs mx-auto">Log your pet's first activity to get this tracker started. Let's go!</p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/activity">
              Log Activity <Forward className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
       </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center justify-between text-gray-900 text-xl">
          <div className="flex items-center gap-2">
            <PawPrint className="text-mint-green" />
            Weekly Activity
          </div>
          {streakCompleted && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground animate-glow">
              <Award className="mr-1 h-4 w-4"/> 5+ Day Streak!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8 pb-4">
        <div className="relative h-14">
          <div className="absolute top-1/2 w-full h-1.5 bg-gray-200 rounded-full -translate-y-1/2">
             <div
                className="h-full bg-mint-green rounded-full"
                style={{ width: `${(completedDays / 7) * 100}%`, transition: 'width 1s ease-out' }}
              />
          </div>
          <div className="absolute -top-1 w-full" style={pawPositionStyle}>
            <PawPrint className="w-8 h-8 text-mint-green drop-shadow-md" />
          </div>

          <div className="grid grid-cols-7 h-full">
            {dayLabels.map((_, index) => (
                <div key={index} className="flex justify-center items-center">
                    <div
                        className={cn(
                        'w-3.5 h-3.5 rounded-full border-2 bg-card transition-colors z-10',
                        activeDays[index] ? 'border-mint-green bg-mint-green' : 'border-gray-300'
                        )}
                    />
                </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 text-center">
            {dayLabels.map((label, index) => (
                <p key={index} className={cn(
                    "font-semibold text-gray-600 transition-colors",
                    index === currentDayIndex && isClient ? "text-gray-900" : ""
                )}>{label}</p>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
