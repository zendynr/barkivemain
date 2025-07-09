import { MemoriesCarousel } from '@/components/dashboard/MemoriesCarousel';
import { memories } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';

export default function MemoriesPage() {
  const sortedMemories = [...memories].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const featuredMemory = sortedMemories[0];
  const otherMemories = sortedMemories.slice(1);

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
         <header className="mb-8">
            <h1 className="font-headline text-3xl font-bold text-gray-900">Memories</h1>
            <p className="text-gray-700">A gallery of your favorite moments.</p>
        </header>

        {featuredMemory && (
            <section className="mb-8">
                <h2 className="font-headline text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="text-yellow-400" />
                    Featured Memory
                </h2>
                <Card className="rounded-2xl shadow-lg overflow-hidden group">
                    <div className="relative aspect-w-16 aspect-h-9 w-full h-96">
                         <Image
                          src={featuredMemory.imageUrl}
                          alt={featuredMemory.caption}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint={featuredMemory.aiHint}
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6">
                            <h3 className="text-white font-bold text-2xl">{featuredMemory.caption}</h3>
                            <p className="text-gray-200 text-sm">{featuredMemory.timestamp.toLocaleDateString()}</p>
                        </div>
                    </div>
                </Card>
            </section>
        )}

        <MemoriesCarousel memories={otherMemories.length > 0 ? otherMemories : memories} />
      </div>
    </div>
  );
}
