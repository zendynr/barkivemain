// A new component to show the pet's mood
'use client';

import { useMemo } from 'react';
import type { ActivityLog, FeedingLog } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Meh, Frown, PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mood = 'Happy' | 'Neutral' | 'Grumpy';

const moodConfig: Record<
  Mood,
  { icon: React.ElementType; color: string; message: string }
> = {
  Happy: {
    icon: Smile,
    color: 'text-mint-green',
    message: 'is feeling fantastic today!',
  },
  Neutral: {
    icon: Meh,
    color: 'text-gray-500',
    message: 'is having a chill day.',
  },
  Grumpy: {
    icon: Frown,
    color: 'text-coral-blush',
    message: 'seems a bit off today.',
  },
};

export function MoodCard({
  activityLogs,
  feedingLogs,
  petName,
}: {
  activityLogs: ActivityLog[];
  feedingLogs: FeedingLog[];
  petName: string;
}) {
  const mood = useMemo((): Mood => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const todaysActivity = activityLogs.filter(
      (log) => new Date(log.timestamp) >= startOfToday
    ).length;
    const todaysMeals = feedingLogs.filter(
      (log) => new Date(log.timestamp) >= startOfToday
    ).length;

    if (todaysActivity > 0 && todaysMeals >= 2) return 'Happy';
    if (todaysActivity === 0 && todaysMeals < 2) return 'Grumpy';
    return 'Neutral';
  }, [activityLogs, feedingLogs]);

  const { icon: Icon, color, message } = moodConfig[mood];

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-gray-900 text-xl">
          <PawPrint className="text-lavender" />
          Today's Mood
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center bg-opacity-20',
              mood === 'Happy' && 'bg-mint-green/20',
              mood === 'Neutral' && 'bg-gray-500/20',
              mood === 'Grumpy' && 'bg-coral-blush/20'
            )}
          >
            <Icon className={cn('w-12 h-12', color)} />
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900">{mood}</p>
            <p className="text-gray-600">
              {petName} {message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
