'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { feedingLogs as initialFeedingLogs } from '@/lib/mock-data';
import type { FeedingLog } from '@/lib/types';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, UtensilsCrossed, Clock, Smile, Meh, Frown, Utensils, Bone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BowlIcon } from '@/components/icons';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  foodType: z.enum(['Kibble', 'Wet Food', 'Treat', 'Other']),
  quantity: z.string().min(1, 'Quantity is required.'),
  notes: z.string().optional(),
  reaction: z.enum(['happy', 'neutral', 'displeased']).optional(),
});

type Reaction = 'happy' | 'neutral' | 'displeased';

const reactionIcons: Record<Reaction, React.ElementType> = {
  happy: Smile,
  neutral: Meh,
  displeased: Frown,
};

function AddFeedingDialog({ onAddFeeding, open, onOpenChange }: { onAddFeeding: (newLog: Omit<FeedingLog, 'id' | 'timestamp'>) => void; open: boolean; onOpenChange: (open: boolean) => void; }) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodType: 'Kibble',
      quantity: '',
      notes: '',
      reaction: 'happy',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddFeeding({
      ...values,
      foodType: values.foodType as FeedingLog['foodType'],
      reaction: values.reaction as Reaction | undefined,
    });
    toast({
      title: 'Success!',
      description: `Logged ${values.quantity} of ${values.foodType}.`,
    });
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Feeding Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="foodType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a food type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Kibble">Kibble</SelectItem>
                      <SelectItem value="Wet Food">Wet Food</SelectItem>
                      <SelectItem value="Treat">Treat</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1 cup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reaction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reaction</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4 pt-2"
                  >
                    {Object.keys(reactionIcons).map((reaction) => {
                      const Icon = reactionIcons[reaction as Reaction];
                      return (
                         <FormItem key={reaction} className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={reaction} id={`reaction-${reaction}`} className="sr-only" />
                          </FormControl>
                          <FormLabel htmlFor={`reaction-${reaction}`}>
                              <div className={cn(
                                'p-3 rounded-full border-2 transition-colors cursor-pointer',
                                field.value === reaction ? 'bg-accent border-accent-foreground' : 'bg-muted border-transparent'
                              )}>
                                <Icon className={cn(
                                  'w-6 h-6',
                                   field.value === reaction ? 'text-accent-foreground' : 'text-muted-foreground'
                                )}/>
                              </div>
                          </FormLabel>
                        </FormItem>
                      )
                    })}
                  </RadioGroup>
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
                    <Textarea placeholder="Any additional details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Add Entry</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function FeedingList({ logs, onAdd }: { logs: FeedingLog[], onAdd: () => void }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-4 bg-gray-50/50 rounded-2xl border border-dashed">
        <UtensilsCrossed className="w-16 h-16 text-gray-400" />
        <h3 className="font-headline text-2xl font-semibold text-gray-800">No feeding entries yet</h3>
        <p className="text-gray-600 max-w-xs mx-auto">Click the button below to log your pet's first meal and start tracking their diet.</p>
        <Button size="lg" onClick={onAdd} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 rounded-full shadow-lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add First Feeding
        </Button>
      </div>
    );
  }

  const sortedLogs = [...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="space-y-4">
      {sortedLogs.map((log) => {
        const ReactionIcon = log.reaction ? reactionIcons[log.reaction] : null;
        return (
          <Card key={log.id} className="rounded-2xl shadow-sm animate-in fade-in-50 duration-300">
            <CardContent className="p-4 flex items-start justify-between">
              <div className="flex-1">
                <p className="font-bold text-lg text-gray-900">{log.foodType}</p>
                <p className="text-gray-700">{log.quantity}</p>
                {log.notes && <p className="text-sm text-gray-500 mt-2 italic">"{log.notes}"</p>}
              </div>
              <div className="flex items-center gap-4">
                {ReactionIcon && (
                    <div className="p-2 rounded-full bg-muted">
                        <ReactionIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 pt-1">
                    <Clock className="w-4 h-4" />
                    <span>
                    {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
}

function FeedingChart({ logs }: { logs: FeedingLog[] }) {
    const data = useMemo(() => {
        const weekData = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return {
                name: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
                date: date.toDateString(),
                count: 0,
            };
        }).reverse();

        logs.forEach(log => {
            const logDate = new Date(log.timestamp).toDateString();
            const dayIndex = weekData.findIndex(d => d.date === logDate);
            if (dayIndex !== -1) {
                weekData[dayIndex].count++;
            }
        });
        return weekData;
    }, [logs]);

    return (
        <Card className="rounded-2xl shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-gray-900 text-xl">7-Day Frequency</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} width={20} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))' }}
                          cursor={{ fill: 'hsla(var(--accent), 0.2)' }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

type MealStatus = 'Eaten' | 'Not Eaten';
interface Meal {
  name: 'Breakfast' | 'Lunch' | 'Dinner';
  status: MealStatus;
  time?: string;
}

function MealStatusTracker({ logs }: { logs: FeedingLog[] }) {
    const [meals, setMeals] = useState<Meal[]>([
        { name: 'Breakfast', status: 'Not Eaten' },
        { name: 'Lunch', status: 'Not Eaten' },
        { name: 'Dinner', status: 'Not Eaten' },
    ]);
    const prevLogsRef = useRef<FeedingLog[]>(logs);
    const [justUpdated, setJustUpdated] = useState<string | null>(null);

    useEffect(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todaysLogs = logs.filter(log => new Date(log.timestamp) >= startOfToday);

        const updatedMeals = meals.map((meal) => {
            let logForMeal: FeedingLog | undefined;
            if (meal.name === 'Breakfast') {
                logForMeal = todaysLogs.find(log => { const h = new Date(log.timestamp).getHours(); return h >= 4 && h < 11; });
            } else if (meal.name === 'Lunch') {
                logForMeal = todaysLogs.find(log => { const h = new Date(log.timestamp).getHours(); return h >= 11 && h < 16; });
            } else if (meal.name === 'Dinner') {
                logForMeal = todaysLogs.find(log => { const h = new Date(log.timestamp).getHours(); return h >= 16 && h < 22; });
            }

            return logForMeal
                ? { ...meal, status: 'Eaten', time: new Date(logForMeal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                : { ...meal, status: 'Not Eaten', time: undefined };
        });

        setMeals(updatedMeals as Meal[]);

        if (logs.length > prevLogsRef.current.length) {
            const newLog = logs[0];
            const logHour = new Date(newLog.timestamp).getHours();
            let mealName: string | null = null;
            if (logHour >= 4 && logHour < 11) mealName = 'Breakfast';
            else if (logHour >= 11 && logHour < 16) mealName = 'Lunch';
            else if (logHour >= 16 && logHour < 22) mealName = 'Dinner';

            if (mealName) {
                setJustUpdated(mealName);
                setTimeout(() => setJustUpdated(null), 1000);
            }
        }
        prevLogsRef.current = logs;

    }, [logs]);

    return (
        <Card className="rounded-2xl shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-gray-900 text-xl">Daily Meals</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around pt-4">
                {meals.map(meal => (
                    <div key={meal.name} className="flex flex-col items-center gap-2">
                        <div className={cn(
                            'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                            meal.status === 'Eaten' ? 'bg-primary' : 'bg-muted',
                            justUpdated === meal.name && 'animate-pulse-once'
                        )}>
                            <BowlIcon className={cn('w-8 h-8', meal.status === 'Eaten' ? 'text-primary-foreground' : 'text-muted-foreground')} />
                        </div>
                        <p className="font-semibold text-gray-800">{meal.name}</p>
                        <p className="text-xs text-gray-500 h-4">{meal.time || '—'}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function FeedingPage() {
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>(initialFeedingLogs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showTreats, setShowTreats] = useState(true);

  const handleAddFeeding = (newLogData: Omit<FeedingLog, 'id' | 'timestamp'>) => {
    const newLog: FeedingLog = {
      ...newLogData,
      id: `feed${Date.now()}`,
      timestamp: new Date(),
    };
    setFeedingLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  const filteredLogs = useMemo(() => {
    if (showTreats) return feedingLogs;
    return feedingLogs.filter(log => log.foodType !== 'Treat');
  }, [feedingLogs, showTreats]);

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold text-gray-900">Feeding</h1>
            <p className="text-gray-700">Track your pet's meals and treats.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 rounded-full shadow-sm">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Feeding
          </Button>
        </header>

        <AddFeedingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onAddFeeding={handleAddFeeding} />

        <main className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MealStatusTracker logs={feedingLogs} />
                <FeedingChart logs={feedingLogs} />
            </div>
            
            <div className="flex items-center justify-between mt-6 mb-4">
                 <h2 className="font-headline text-2xl font-semibold text-gray-900">Log History</h2>
                 <div className="flex items-center space-x-2">
                    <Switch
                        id="treats-toggle"
                        checked={showTreats}
                        onCheckedChange={setShowTreats}
                    />
                    <Label htmlFor="treats-toggle" className="flex items-center gap-2">
                      <Bone className="w-4 h-4" /> Show Treats</Label>
                </div>
            </div>
          <FeedingList logs={filteredLogs} onAdd={() => setIsDialogOpen(true)} />
        </main>
      </div>
    </div>
  );
}
