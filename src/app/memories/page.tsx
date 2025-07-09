import { MemoriesCarousel } from '@/components/dashboard/MemoriesCarousel';
import { memories } from '@/lib/mock-data';

export default function MemoriesPage() {
  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
         <header className="mb-8">
            <h1 className="font-headline text-3xl font-bold text-gray-900">Memories</h1>
            <p className="text-gray-700">A gallery of your favorite moments.</p>
        </header>
        <MemoriesCarousel memories={memories} />
      </div>
    </div>
  );
}
