import type { Memory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Image from 'next/image';
import { Camera } from 'lucide-react';

export function MemoriesCarousel({ memories }: { memories: Memory[] }) {
  const sortedMemories = [...memories].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  ).slice(0, 10);

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-gray-900 text-xl">
          <Camera className="text-lavender" />
          Recent Memories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {sortedMemories.map((memory) => (
              <CarouselItem key={memory.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="rounded-2xl overflow-hidden group transition-all hover:shadow-lg">
                    <CardContent className="p-0">
                      <div className="aspect-w-16 aspect-h-9">
                        <Image
                          src={memory.imageUrl}
                          alt={memory.caption}
                          width={600}
                          height={400}
                          data-ai-hint={memory.aiHint}
                          className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4 bg-white">
                        <p className="font-semibold text-gray-800 truncate">{memory.caption}</p>
                        <p className="text-xs text-gray-500">
                          {memory.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
