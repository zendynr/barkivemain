'use client';

import type { Pet, ActivityLog, FeedingLog } from '@/lib/types';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Weight, Cake, Smile, Meh, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

export function UserProfile({
  pet,
  activityLogs,
  feedingLogs,
}: {
  pet: Pet;
  activityLogs: ActivityLog[];
  feedingLogs: FeedingLog[];
}) {
  const mood = useMemo((): Mood => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

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

  const { icon: MoodIcon, color, message } = moodConfig[mood];

  return (
    <Card className="rounded-2xl shadow-md overflow-hidden">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-lg">
          <AvatarImage src={pet.avatarUrl} alt={pet.name} data-ai-hint="dog portrait" />
          <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <h2 className="font-headline text-2xl font-bold text-gray-900">
              {pet.name}
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <MoodIcon className={cn('w-8 h-8 cursor-pointer', color)} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {pet.name} {message}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-gray-700 text-lg">{pet.breed}</p>
          <div className="mt-4 flex justify-center sm:justify-start flex-wrap gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-coral-blush" />
              <span>{pet.age} years</span>
            </div>
            <div className="flex items-center gap-2">
              <Weight className="h-5 w-5 text-mint-green" />
              <span>{pet.weight} kg</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
