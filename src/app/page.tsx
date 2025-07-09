import { UserProfile } from '@/components/dashboard/UserProfile';
import { MealTracker } from '@/components/dashboard/MealTracker';
import { ActivityTracker } from '@/components/dashboard/ActivityTracker';
import { MemoriesCarousel } from '@/components/dashboard/MemoriesCarousel';
import { CareTips } from '@/components/dashboard/CareTips';
import { pet, memories, activityLogs, feedingLogs } from '@/lib/mock-data';

export default function Home() {
  return (
    <main className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-gray-900">
            Welcome back!
          </h1>
          <p className="text-gray-700">Here's how {pet.name} is doing today.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
            <UserProfile pet={pet} />
            <MemoriesCarousel memories={memories} />
          </div>

          <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
            <MealTracker feedingLogs={feedingLogs} />
            <ActivityTracker activityLogs={activityLogs} />
            <CareTips pet={pet} />
          </div>
        </div>
      </div>
    </main>
  );
}
