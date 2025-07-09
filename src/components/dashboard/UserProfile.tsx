import type { Pet, ActivityLog, FeedingLog } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Weight, Cake, Dog, Utensils, Footprints } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function getLatestLog(logs: (ActivityLog | FeedingLog)[]) {
  if (!logs || logs.length === 0) return null;
  return logs.reduce((latest, current) =>
    new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
  );
}

export function UserProfile({
  pet,
  activityLogs,
  feedingLogs,
}: {
  pet: Pet;
  activityLogs: ActivityLog[];
  feedingLogs: FeedingLog[];
}) {
  const lastActivity = getLatestLog(activityLogs);
  const lastMeal = getLatestLog(feedingLogs);

  return (
    <Card className="rounded-2xl shadow-md overflow-hidden">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-lg">
          <AvatarImage src={pet.avatarUrl} alt={pet.name} data-ai-hint="dog portrait" />
          <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left flex-1">
          <h2 className="font-headline text-2xl font-bold text-gray-900">{pet.name}</h2>
          <p className="text-gray-700 text-lg">{pet.breed}</p>
          <div className="mt-4 flex justify-center sm:justify-start flex-wrap gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-coral-blush" />
              <span>{pet.age} years</span>
            </div>
            <div className="flex items-center gap-2">
              <Weight className="h-5 w-5 text-mint-green" />
              <span>{pet.weight} kg</span>
            </div>
          </div>
           <div className="mt-4 flex justify-center sm:justify-start gap-2 flex-wrap">
            {lastMeal && (
              <Badge variant="outline" className="text-sm py-1">
                <Utensils className="h-4 w-4 mr-2" />
                Last meal: {formatDistanceToNow(new Date(lastMeal.timestamp), { addSuffix: true })}
              </Badge>
            )}
            {lastActivity && (
              <Badge variant="outline" className="text-sm py-1">
                 <Footprints className="h-4 w-4 mr-2" />
                Active: {formatDistanceToNow(new Date(lastActivity.timestamp), { addSuffix: true })}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
