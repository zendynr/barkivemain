import type { Pet } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Weight, Cake, Dog } from 'lucide-react';

export function UserProfile({ pet }: { pet: Pet }) {
  return (
    <Card className="rounded-2xl shadow-md overflow-hidden">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-lg">
          <AvatarImage src={pet.avatarUrl} alt={pet.name} data-ai-hint="dog portrait" />
          <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h2 className="font-headline text-2xl font-bold text-gray-900">{pet.name}</h2>
          <p className="text-gray-700 text-lg">{pet.breed}</p>
          <div className="mt-4 flex justify-center sm:justify-start gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-coral-blush" />
              <span>{pet.age} years</span>
            </div>
            <div className="flex items-center gap-2">
              <Weight className="h-5 w-5 text-mint-green" />
              <span>{pet.weight} kg</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
