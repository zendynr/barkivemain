'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const todaysLogs = feedingLogs.filter(
      (log) => new Date(log.timestamp) >= startOfToday
    );

    const updatedMeals = meals.map((meal) => {
      let logForMeal: FeedingLog | undefined;
      const hour = new Date().getHours();

      if (meal.name === 'Breakfast') {
        logForMeal = todaysLogs.find((log) => {
          const logHour = new Date(log.timestamp).getHours();
          return logHour >= 4 && logHour < 11;
        });
      } else if (meal.name === 'Lunch') {
        logForMeal = todaysLogs.find((log) => {
          const logHour = new Date(log.timestamp).getHours();
          return logHour >= 11 && logHour < 16;
        });
      } else if (meal.name === 'Dinner') {
        logForMeal = todaysLogs.find((log) => {
          const logHour = new Date(log.timestamp).getHours();
          return logHour >= 16 && logHour < 22;
        });
      }

      if (logForMeal) {
        return {
          ...meal,
          status: 'Eaten',
          time: new Date(logForMeal.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      }
      return meal;
    });

    setMeals(updatedMeals as Meal[]);
  }, [feedingLogs]);

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-gray-900 text-xl">
          <Utensils className="text-coral-blush" />
          Meal Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around gap-4">
          {meals.map((meal) => (
            <div key={meal.name} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out',
                  meal.status === 'Eaten' ? 'bg-opacity-100' : 'bg-gray-200'
                )}
                style={{ backgroundColor: meal.status === 'Eaten' ? meal.color : undefined }}
              >
                <BowlIcon
                  className={cn(
                    'w-10 h-10 transition-colors',
                    meal.status === 'Eaten' ? 'text-white' : 'text-gray-400'
                  )}
                />
              </div>
              <p className="font-semibold text-gray-800">{meal.name}</p>
              <p className="text-xs text-gray-500 h-4">
                {meal.status === 'Eaten' ? meal.time : ''}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
