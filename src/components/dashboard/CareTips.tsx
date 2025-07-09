'use client';

import { useState } from 'react';
import { getPersonalizedCareTips } from '@/ai/flows/personalized-care-tips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Pet } from '@/lib/types';
import { Sparkles, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CareTips({ pet }: { pet: Pet }) {
  const [tips, setTips] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGetTips = async () => {
    setLoading(true);
    setTips('');
    try {
      const result = await getPersonalizedCareTips({
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
      });
      setTips(result.careTips);
    } catch (error) {
      console.error('Failed to get care tips:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch care tips. Please try again later.',
      });
    }
    setLoading(false);
  };

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-gray-900 text-xl">
          <Sparkles className="text-lavender" />
          Personalized Care Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[75%]" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        ) : tips ? (
          <p className="text-base text-gray-700 leading-relaxed">{tips}</p>
        ) : (
          <div className="text-center flex flex-col items-center gap-4 py-4">
            <Bot className="w-12 h-12 text-gray-300" />
            <p className="text-gray-600">Get AI-powered care tips tailored for {pet.name}!</p>
            <Button
              onClick={handleGetTips}
              className={cn(
                "bg-lavender text-accent-foreground hover:bg-lavender/90",
                !tips && "animate-glow"
              )}
            >
              Generate Tips
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
