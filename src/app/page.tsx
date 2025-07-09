'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/components/dashboard/UserProfile';
import { ActivityTracker } from '@/components/dashboard/ActivityTracker';
import { CareTips } from '@/components/dashboard/CareTips';
import { MealTracker } from '@/components/dashboard/MealTracker';
import { useAuth } from '@/hooks/use-auth';
import { usePets } from '@/hooks/use-pets';
import { useActivityLogs } from '@/hooks/use-activity-logs';
import { useFeedingLogs } from '@/hooks/use-feeding-logs';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const router = useRouter();
  const { userId } = useAuth();
  const { pets, loading: petsLoading } = usePets(userId);
  const [activePetId, setActivePetId] = useState<string | null>(null);

  useEffect(() => {
    if (!petsLoading) {
      if (pets.length === 0) {
        router.push('/onboarding');
      } else {
        setActivePetId(pets[0].id);
      }
    }
  }, [pets, petsLoading, router]);

  const activePet = pets.find(p => p.id === activePetId);
  
  const { activityLogs, loading: activityLoading } = useActivityLogs(userId, activePetId);
  const { feedingLogs, loading: feedingLoading } = useFeedingLogs(userId, activePetId);
  
  const isLoading = petsLoading || (activePetId && (activityLoading || feedingLoading));

  if (isLoading || !activePetId) {
    return (
      <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <Skeleton className="h-10 w-1/2 rounded-lg" />
            <Skeleton className="h-4 w-1/3 mt-2 rounded-lg" />
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-60 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-60 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activePet) {
     // This state is temporary while redirecting
    return null;
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-gray-900">
            Welcome back!
          </h1>
          <p className="text-gray-700">Here's a summary of how {activePet.name} is doing.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <UserProfile pet={activePet} activityLogs={activityLogs} feedingLogs={feedingLogs} />
            <ActivityTracker activityLogs={activityLogs} />
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <MealTracker feedingLogs={feedingLogs} />
            <CareTips pet={activePet} />
          </div>
        </div>
      </div>
    </div>
  );
}
