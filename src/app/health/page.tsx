import { CareTips } from '@/components/dashboard/CareTips';
import { pet } from '@/lib/mock-data';

export default function HealthPage() {
  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
            <h1 className="font-headline text-3xl font-bold text-gray-900">Health</h1>
            <p className="text-gray-700">Personalized tips to keep your pet healthy and happy.</p>
        </header>
        <div className="max-w-lg mx-auto">
         <CareTips pet={pet} />
        </div>
      </div>
    </div>
  );
}
