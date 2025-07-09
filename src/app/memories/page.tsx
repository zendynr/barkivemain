'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMemories } from '@/hooks/use-memories';
import { Skeleton } from '@/components/ui/skeleton';

export default function MemoriesPage() {
  const { userId, petId } = useAuth();
  const { memories, loading } = useMemories(userId, petId);

  const sortedMemories = [...memories].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const featuredMemory = sortedMemories[0];
  const otherMemories = sortedMemories.slice(1);

  if (loading) {
    return (
       <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <Skeleton className="h-10 w-1/3 rounded-lg" />
                <Skeleton className="h-4 w-1/2 mt-2 rounded-lg" />
            </header>
             <section className="mb-8">
                <Skeleton className="h-96 w-full rounded-2xl" />
            </section>
             <section>
                <Skeleton className="h-8 w-1/4 mb-4 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </section>
        </div>
       </div>
    )
  }

  if (memories.length === 0) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">No Memories Yet</h2>
                <p className="text-gray-600">Add your first memory to start your pet's album.</p>
            </div>
        </div>
      )
  }

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
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{objectFit: 'cover'}}
                          data-ai-hint={featuredMemory.aiHint}
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6">
                            <h3 className="text-white font-bold text-2xl">{featuredMemory.caption}</h3>
                            <p className="text-gray-200 text-sm">{new Date(featuredMemory.timestamp).toLocaleDateString()}</p>
                        </div>
                    </div>
                </Card>
            </section>
        )}

        <section>
             <h2 className="font-headline text-2xl font-semibold text-gray-900 mb-4">Gallery</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(otherMemories.length > 0 ? otherMemories : memories).map((memory) => (
                     <Card key={memory.id} className="rounded-2xl overflow-hidden group transition-all hover:shadow-lg">
                        <CardContent className="p-0">
                            <div className="relative w-full" style={{paddingBottom: '75%'}}>
                                <Image
                                src={memory.imageUrl}
                                alt={memory.caption}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                style={{objectFit: 'cover'}}
                                data-ai-hint={memory.aiHint}
                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-3 bg-white">
                                <p className="font-semibold text-gray-800 truncate text-sm">{memory.caption}</p>
                                <p className="text-xs text-gray-500">
                                {new Date(memory.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
             </div>
        </section>
      </div>
    </div>
  );
}
