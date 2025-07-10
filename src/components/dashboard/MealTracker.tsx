'use client';

import { useState, useEffect, useRef } from 'react';
import type { FeedingLog, Pet } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BowlIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Utensils } from 'lucide-react';

type MealStatus = 'Eaten' | 'Not Eaten';
interface Meal {
  name: 'Breakfast' | 'Lunch' | 'Dinner' | 'Afternoon';
  status: MealStatus;
  time?: string;
  color: string;
}

const mealConfig = {
  morning: { name: 'Breakfast', color: 'hsl(var(--secondary))' },
  afternoon: { name: 'Lunch', color: 'hsl(var(--primary))' },
  evening: { name: 'Dinner', color: 'hsl(var(--accent))' },
}

const mealTimeRanges = {
  morning: { start: 4, end: 11},
  afternoon: { start: 11, end: 16 },
  evening: { start: 16, end: 22 },
}

export function MealTracker({ pet, feedingLogs }: { pet: Pet; feedingLogs: FeedingLog[] }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [justUpdated, setJustUpdated] = useState<string | null>(null);
  const prevLogsRef = useRef<FeedingLog[]>(feedingLogs);

  useEffect(() => {
    const scheduledMeals = (pet.feedingSchedule || ['morning', 'afternoon', 'evening'])
      .map(scheduleType => mealConfig[scheduleType])
      .filter(Boolean)
      .map(config => ({...config, status: 'Not Eaten' as MealStatus}));
    
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todaysLogs = feedingLogs.filter(log => new Date(log.timestamp) >= startOfToday);

    const updatedMeals = scheduledMeals.map(meal => {
        const scheduleType = Object.keys(mealConfig).find(key => mealConfig[key as keyof typeof mealConfig].name === meal.name) as keyof typeof mealTimeRanges | undefined;

        if (!scheduleType) return meal;

        const timeRange = mealTimeRanges[scheduleType];
        const logForMeal = todaysLogs.find(log => {
            const logHour = new Date(log.timestamp).getHours();
            return logHour >= timeRange.start && logHour < timeRange.end;
        });

        if (logForMeal) {
            return {
                ...meal,
                status: 'Eaten' as MealStatus,
                time: new Date(logForMeal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
        }
        return meal;
    });

    setMeals(updatedMeals as Meal[]);

    if (feedingLogs.length > prevLogsRef.current.length) {
      const newLog = feedingLogs[0];
      const logHour = new Date(newLog.timestamp).getHours();
      
      let mealName: string | null = null;
      for (const scheduleType of (pet.feedingSchedule || [])) {
        const range = mealTimeRanges[scheduleType];
        if (logHour >= range.start && logHour < range.end) {
          mealName = mealConfig[scheduleType].name;
          break;
        }
      }

      if (mealName) {
        setJustUpdated(mealName);
        setTimeout(() => setJustUpdated(null), 1000);
      }
    }
    prevLogsRef.current = feedingLogs;

  }, [feedingLogs, pet.feedingSchedule]);
  
  if (meals.length === 0) {
    return null; // Or a placeholder card
  }

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-gray-900 text-xl">
          <Utensils className="text-coral-blush" />
          Meal Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around gap-2 sm:gap-4">
          {meals.map((meal) => (
            <div key={meal.name} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out',
                  meal.status === 'Eaten' ? 'bg-opacity-100' : 'bg-gray-200',
                  justUpdated === meal.name && 'animate-pulse-once'
                )}
                style={{ backgroundColor: meal.status === 'Eaten' ? meal.color : undefined }}
              >
                <BowlIcon
                  className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 transition-colors',
                    meal.status === 'Eaten' ? 'text-white' : 'text-gray-400'
                  )}
                />
              </div>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">{meal.name}</p>
              <p className="text-xs text-gray-500 h-4">
                {meal.status === 'Eaten' ? meal.time : '—'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
