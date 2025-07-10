'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ActivityLog } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, Award, Forward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ActivityTracker({ activityLogs }: { activityLogs: ActivityLog[] }) {
  const [activeDays, setActiveDays] = useState<boolean[]>(Array(7).fill(false));
  const [animatedDays, setAnimatedDays] = useState<boolean[]>(Array(7).fill(false));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(firstDayOfWeek);
        date.setDate(firstDayOfWeek.getDate() + i);
        return date;
    });

    const newActiveDays = weekDates.map(weekDate =>
        activityLogs.some(log => {
            const logDate = new Date(log.timestamp);
            return logDate.toDateString() === weekDate.toDateString();
        })
    );

    setActiveDays(newActiveDays);

    // Trigger animation for newly active days
    const newAnimatedDays = newActiveDays.map((active, i) => active && !activeDays[i]);
    setAnimatedDays(newAnimatedDays);

  }, [activityLogs]);

  const completedDays = activeDays.filter(Boolean).length;
  const streakCompleted = completedDays >= 5;

  if (activityLogs.length === 0 && isClient) {
    return (
       <Card className="rounded-2xl shadow-md bg-mint-green/20">
        <CardContent className="p-6 text-center flex flex-col items-center justify-center gap-4 min-h-[240px]">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
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
            <Badge variant="secondary" className="bg-amber-400 text-amber-900 animate-glow border-amber-500">
              <Award className="mr-1 h-4 w-4"/> 5+ Day Streak!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        <TooltipProvider>
          <div className="flex justify-around items-center">
            {dayLabels.map((label, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                 <Tooltip>
                    <TooltipTrigger>
                       <div className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                          activeDays[index] ? 'bg-mint-green border-mint-green/50' : 'bg-gray-100 border-gray-200'
                        )}>
                          <PawPrint className={cn(
                            'w-8 h-8 transition-colors',
                            activeDays[index] ? 'text-white' : 'text-gray-300',
                             animatedDays[index] && 'animate-stamp'
                          )} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{activeDays[index] ? 'Activity logged!' : 'No activity yet'}</p>
                    </TooltipContent>
                </Tooltip>
                <p className="font-semibold text-gray-600 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
