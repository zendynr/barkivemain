'use client';

import { useState, useEffect, useRef } from 'react';
import type { FeedingLog } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BowlIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Utensils } from 'lucide-react';

type MealStatus = 'Eaten' | 'Not Eaten';
interface Meal {
  name: 'Breakfast' | 'Lunch' | 'Dinner';
  status: MealStatus;
  time?: string;
  color: string;
}

export function MealTracker({ feedingLogs }: { feedingLogs: FeedingLog[] }) {
  const [meals, setMeals] = useState<Meal[]>([
    { name: 'Breakfast', status: 'Not Eaten', color: '#FAD3D3' },
    { name: 'Lunch', status: 'Not Eaten', color: '#D7EAD9' },
    { name: 'Dinner', status: 'Not Eaten', color: '#E5D4EF' },
  ]);
  const [justUpdated, setJustUpdated] = useState<string | null>(null);
  const prevLogsRef = useRef<FeedingLog[]>(feedingLogs);

  useEffect(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todaysLogs = feedingLogs.filter(log => new Date(log.timestamp) >= startOfToday);

    const updatedMeals = meals.map((meal) => {
      let logForMeal: FeedingLog | undefined;
      if (meal.name === 'Breakfast') {
        logForMeal = todaysLogs.find(log => { const h = new Date(log.timestamp).getHours(); return h >= 4 && h < 11; });
      } else if (meal.name === 'Lunch') {
        logForMeal = todaysLogs.find(log => { const h = new Date(log.timestamp).getHours(); return h >= 11 && h < 16; });
      } else if (meal.name === 'Dinner') {
        logForMeal = todaysLogs.find(log => { const h = new Date(log.timestamp).getHours(); return h >= 16 && h < 22; });
      }

      return logForMeal
        ? { ...meal, status: 'Eaten' as MealStatus, time: new Date(logForMeal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : { ...meal, status: 'Not Eaten' as MealStatus, time: undefined };
    });

    setMeals(updatedMeals as Meal[]);

    if (feedingLogs.length > prevLogsRef.current.length) {
      const newLog = feedingLogs.find(log => !prevLogsRef.current.some(prevLog => prevLog.id === log.id));
      if (newLog) {
          const logHour = new Date(newLog.timestamp).getHours();
          let mealName: string | null = null;
          if (logHour >= 4 && logHour < 11) mealName = 'Breakfast';
          else if (logHour >= 11 && logHour < 16) mealName = 'Lunch';
          else if (logHour >= 16 && logHour < 22) mealName = 'Dinner';

          if (mealName) {
              setJustUpdated(mealName);
              setTimeout(() => setJustUpdated(null), 1000);
          }
      }
    }
    prevLogsRef.current = feedingLogs;
  }, [feedingLogs]);

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-gray-900 text-xl">
          <Utensils className="text-coral-blush" />
          Meal Completion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around gap-2 sm:gap-4 pt-2">
          {meals.map((meal) => (
            <div key={meal.name} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out',
                  meal.status === 'Eaten' ? 'bg-opacity-100' : 'bg-gray-100',
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
