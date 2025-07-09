import { ActivityTracker } from '@/components/dashboard/ActivityTracker';
import { activityLogs } from '@/lib/mock-data';

export default function ActivityPage() {
  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
            <h1 className="font-headline text-3xl font-bold text-gray-900">Activity</h1>
            <p className="text-gray-700">Keep track of your pet's weekly exercise.</p>
        </header>
        <div className="max-w-lg mx-auto">
          <ActivityTracker activityLogs={activityLogs} />
        </div>
      </div>
    </div>
  );
}
