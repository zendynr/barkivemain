'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ActivityLog } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ActivityTracker({ activityLogs }: { activityLogs: ActivityLog[] }) {
  const [activeDays, setActiveDays] = useState<boolean[]>(Array(7).fill(false));

  const weekDates = useMemo(() => {
    const today = new Date();
    // Set to Monday of the current week
    const firstDay = new Date(today);
    const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ...
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    firstDay.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      return date;
    });
  }, []);

  useEffect(() => {
    const isSameDay = (date1: Date, date2: Date) =>
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();

    const newActiveDays = weekDates.map(weekDate =>
      activityLogs.some(log => isSameDay(new Date(log.timestamp), weekDate))
    );
    
    // Set a timeout to apply animation class slightly after mount
    const timer = setTimeout(() => {
        setActiveDays(newActiveDays);
    }, 100);

    return () => clearTimeout(timer);
  }, [activityLogs, weekDates]);

  const completedDays = activeDays.filter(Boolean).length;
  const streakCompleted = completedDays >= 5;

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
      <CardContent>
        <div className="flex justify-around gap-2">
          {dayLabels.map((label, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                  activeDays[index] ? 'bg-mint-green' : 'bg-gray-200'
                )}
              >
                <PawPrint
                  className={cn(
                    'w-7 h-7',
                    activeDays[index] ? 'text-white animate-stamp' : 'text-gray-400'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              </div>
              <p className="font-semibold text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
