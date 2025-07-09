'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ActivityLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Clock, Flame, Trophy, Award, Footprints } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { useActivityLogs } from '@/hooks/use-activity-logs';
import { addActivityLog } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  type: z.enum(['walk', 'play', 'training']),
  duration: z.coerce.number().min(1, 'Duration is required.'),
  notes: z.string().optional(),
});

function AddActivityDialog({ onAddActivity, open, onOpenChange }: { onAddActivity: (newLog: Omit<ActivityLog, 'id' | 'timestamp'>) => Promise<void>; open: boolean; onOpenChange: (open: boolean) => void; }) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'walk',
      duration: 30,
      notes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await onAddActivity(values);
    toast({
      title: 'Success!',
      description: `Logged a ${values.duration} minute ${values.type}.`,
    });
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="walk">Walk</SelectItem>
                      <SelectItem value="play">Play</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any highlights from the activity?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Add Entry</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ActivityList({ logs, onAdd, isLoading }: { logs: ActivityLog[]; onAdd: () => void; isLoading: boolean; }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isLoading) {
      return (
          <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
      )
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center gap-4 bg-gray-50/50 rounded-2xl border border-dashed">
        <Footprints className="w-16 h-16 text-gray-400" />
        <h3 className="font-headline text-2xl font-semibold text-gray-800">Ready for an adventure?</h3>
        <p className="text-gray-600 max-w-xs mx-auto">Log your pet's first activity to get this tracker started. Let's go!</p>
         <Button size="lg" onClick={onAdd} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 rounded-full shadow-lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Log First Activity
        </Button>
      </div>
    );
  }

  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-4">
      {sortedLogs.map((log) => (
        <Card key={log.id} className="rounded-2xl shadow-sm animate-in fade-in-50 duration-300">
          <CardContent className="p-4 flex items-start justify-between">
            <div className="flex-1">
              <p className="font-bold text-lg text-gray-900 capitalize">{log.type}</p>
              <p className="text-gray-700">{log.duration} minutes</p>
              {log.notes && <p className="text-sm text-gray-500 mt-2 italic">"{log.notes}"</p>}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 ml-4 pt-1">
              <Clock className="w-4 h-4" />
              <span>
                {isClient ? new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ActivityChart({ logs }: { logs: ActivityLog[] }) {
    const [data, setData] = useState(Array(7).fill({ name: '', duration: 0 }));

    useEffect(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const weekData = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return {
                name: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
                date,
                duration: 0,
            };
        });

        logs.forEach(log => {
            const logDate = new Date(log.timestamp);
            const dayIndex = weekData.findIndex(d => d.date.toDateString() === logDate.toDateString());
            if (dayIndex !== -1) {
                weekData[dayIndex].duration += log.duration;
            }
        });

        setData(weekData);
    }, [logs]);

    return (
        <Card className="rounded-2xl shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-gray-900 text-xl flex items-center gap-2">
                    <Footprints className="text-mint-green" />
                    Daily Minutes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} width={20} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '1rem',
                            border: '1px solid hsl(var(--border))',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                          }}
                          cursor={{ fill: 'hsla(var(--accent), 0.2)' }}
                        />
                        <Bar dataKey="duration" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function StreakCard({ logs }: { logs: ActivityLog[] }) {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
      if (logs.length === 0) {
        setStreak(0);
        return;
      };

      const uniqueDays = [...new Set(logs.map(log => new Date(log.timestamp).toDateString()))].map(dateStr => new Date(dateStr));
      uniqueDays.sort((a, b) => b.getTime() - a.getTime());

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0,0,0,0);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const firstLogDay = uniqueDays[0];
      firstLogDay.setHours(0,0,0,0);
      
      if (firstLogDay.getTime() === today.getTime() || firstLogDay.getTime() === yesterday.getTime()) {
          currentStreak = 1;
          for (let i = 0; i < uniqueDays.length - 1; i++) {
              const day = uniqueDays[i];
              const prevDay = uniqueDays[i+1];
              const diff = (day.getTime() - prevDay.getTime()) / (1000 * 3600 * 24);
              if (diff === 1) {
                  currentStreak++;
              } else {
                  break;
              }
          }
      }
      setStreak(currentStreak);
    }, [logs]);

    return (
        <Card className="rounded-2xl shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Flame className="w-8 h-8 text-coral-blush" />
                    <div>
                        <p className="font-bold text-gray-900">Activity Streak</p>
                        <p className="text-sm text-gray-600">Keep it going!</p>
                    </div>
                </div>
                <p className="text-3xl font-bold text-coral-blush">{streak} <span className="text-lg">days</span></p>
            </CardContent>
        </Card>
    );
}

function WeeklyGoalCard({ logs }: { logs: ActivityLog[] }) {
    const weeklyGoal = 300; // 300 minutes
    const [totalMinutes, setTotalMinutes] = useState(0);
    
    useEffect(() => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const minutes = logs
          .filter(log => new Date(log.timestamp) >= startOfWeek)
          .reduce((total, log) => total + log.duration, 0);
      setTotalMinutes(minutes);
    }, [logs]);

    const percentage = Math.min(Math.round((totalMinutes / weeklyGoal) * 100), 100);
    const data = [{ name: 'goal', value: percentage, fill: 'hsl(var(--primary))' }];
    
    return (
        <Card className="rounded-2xl shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
                 <div>
                    <p className="font-bold text-gray-900">Weekly Goal</p>
                    <p className="text-sm text-gray-600">{totalMinutes} / {weeklyGoal} mins</p>
                </div>
                <div className="w-20 h-20 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                          innerRadius="70%"
                          outerRadius="100%"
                          barSize={8}
                          data={data}
                          startAngle={90}
                          endAngle={-270}
                      >
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar
                              background={{ fill: 'hsl(var(--muted))' }}
                              dataKey="value"
                              cornerRadius={10}
                              className="fill-primary"
                          />
                      </RadialBarChart>
                  </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-lg font-bold text-gray-900">{percentage}%</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function BadgesCard({ logs }: { logs: ActivityLog[] }) {
  const unlockedBadges = useMemo(() => {
    const badges = [];
    if (logs.some(log => log.duration >= 60)) {
      badges.push({ icon: Award, label: 'Marathoner' });
    }
    if (logs.some(log => new Date(log.timestamp).getHours() < 7 && log.type === 'walk')) {
       badges.push({ icon: Trophy, label: 'Early Riser' });
    }
    return badges;
  }, [logs]);

  if (unlockedBadges.length === 0) return null;

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-gray-900 text-xl flex items-center gap-2">
          <Trophy className="text-lavender"/>
          Unlocked Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        {unlockedBadges.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-lavender/20">
              <Icon className="w-6 h-6 text-lavender"/>
            </div>
            <p className="text-sm font-semibold">{label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function ActivityPage() {
  const { userId, petId } = useAuth();
  const { activityLogs, loading } = useActivityLogs(userId, petId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddActivity = async (newLogData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    if (!userId || !petId) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No active pet selected.',
      });
      return;
    }
    try {
      await addActivityLog(userId, petId, newLogData);
    } catch (error) {
      console.error("Failed to add activity log: ", error);
      toast({
        variant: 'destructive',
        title: 'Error logging activity',
        description: 'Could not save the activity log. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-headline text-3xl font-bold text-gray-900">Activity</h1>
              <p className="text-gray-700">Keep track of your pet's weekly exercise.</p>
            </div>
             <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 rounded-full shadow-sm"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Log Activity
            </Button>
        </header>
        
        <AddActivityDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onAddActivity={handleAddActivity} />

        <main className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StreakCard logs={activityLogs} />
            <WeeklyGoalCard logs={activityLogs} />
          </div>

          <BadgesCard logs={activityLogs} />
          <ActivityChart logs={activityLogs} />

          <div>
             <h2 className="font-headline text-2xl font-semibold text-gray-900 mb-4">Recent Logs</h2>
            <ActivityList logs={activityLogs} onAdd={() => setIsDialogOpen(true)} isLoading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
}
