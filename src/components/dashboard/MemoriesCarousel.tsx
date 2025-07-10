'use client';

import type { Memory } from '@/lib/types';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import Link from 'next/link';

export function MemoriesCarousel({ memories }: { memories: Memory[] }) {
  if (!memories || memories.length === 0) {
    return (
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6 text-center flex flex-col items-center justify-center gap-4 min-h-[224px] bg-gray-50/50">
          <Camera className="w-12 h-12 text-gray-400" />
          <h3 className="font-headline text-xl font-semibold text-gray-800">
            No memories yet
          </h3>
          <p className="text-gray-600">
            Go to the{' '}
            <Link href="/memories" className="text-primary hover:underline font-semibold">
              Memories
            </Link>{' '}
            tab to add your first photo!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get the 10 most recent memories
  const recentMemories = memories.slice(0, 10);

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: recentMemories.length > 3,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {recentMemories.map((memory) => (
          <CarouselItem key={memory.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="rounded-2xl overflow-hidden shadow-sm h-56 group">
                <CardContent className="flex flex-col items-center justify-center h-full p-0 relative">
                  <Image
                    src={memory.imageUrl}
                    alt={memory.caption}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{objectFit: 'cover'}}
                    data-ai-hint={memory.aiHint}
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                      <p className="text-white font-bold text-sm line-clamp-2">{memory.caption}</p>
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
  );
}
