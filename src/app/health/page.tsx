'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import {
  HeartPulse,
  Weight,
  Thermometer,
  Pill,
  PlusCircle,
  Stethoscope,
  Scissors,
  Syringe,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useHealthLogs } from '@/hooks/use-health-logs';
import { useReminders } from '@/hooks/use-reminders';
import type { HealthLog, Reminder } from '@/lib/types';


const reminderIcons: Record<Reminder['type'], { icon: React.ElementType; color: string }> = {
  vaccination: { icon: Syringe, color: 'text-mint-green' },
  appointment: { icon: Stethoscope, color: 'text-coral-blush' },
  grooming: { icon: Scissors, color: 'text-lavender' },
  medication: { icon: Pill, color: 'text-yellow-500' },
};

const timelineIcons: Record<HealthLog['type'], { icon: React.ElementType; color: string }> = {
  'vet-visit': { icon: Stethoscope, color: 'text-coral-blush' },
  vaccination: { icon: Syringe, color: 'text-mint-green' },
  grooming: { icon: Scissors, color: 'text-lavender' },
  weight: { icon: Weight, color: 'text-blue-500' },
  temperature: { icon: Thermometer, color: 'text-orange-500' },
  medication: { icon: Pill, color: 'text-yellow-500' },
};

function HealthProgressRing({ score }: { score: number }) {
  const color = score > 80 ? 'hsl(var(--primary))' : score > 50 ? 'hsl(var(--chart-4))' : 'hsl(var(--destructive))';
  const data = [{ name: 'score', value: score, fill: color }];

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-gray-900 text-xl flex items-center gap-2">
          <HeartPulse className="text-coral-blush" />
          Wellness Check
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-40 h-40 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={12} data={data} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-4xl font-bold text-gray-900" style={{ color }}>{score}<span className="text-2xl text-gray-500">%</span></p>
          </div>
        </div>
        <p className="text-center text-gray-600">Your pet's health log is {score}% up-to-date!</p>
      </CardContent>
    </Card>
  );
}

function RemindersCard({ reminders }: { reminders: Reminder[] }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-gray-900 text-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-lavender" />
            Reminders
          </div>
          <Button size="sm" variant="ghost"><PlusCircle className="mr-2" />Add</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {reminders.map((reminder) => {
              const { icon: Icon, color } = reminderIcons[reminder.type] || reminderIcons.medication;
              const dueDate = new Date(reminder.due);
              const isOverdue = dueDate < new Date();
              return (
                <AccordionItem value={`item-${reminder.id}`} key={reminder.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-full bg-opacity-20', color.replace('text-', 'bg-'))}>
                        <Icon className={cn('w-5 h-5', color)} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{reminder.name}</p>
                        {isClient && (
                          <p className={cn("text-sm", isOverdue ? "text-destructive" : "text-gray-600")}>
                            Due: {formatDistanceToNow(dueDate, { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700 pl-12">Set a reminder for {isClient ? format(dueDate, 'PPP') : ''}.</p>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        ) : (
          <p className="text-gray-500 text-center py-4">No upcoming reminders.</p>
        )}
      </CardContent>
    </Card>
  );
}

function HealthTimeline({ events }: { events: HealthLog[] }) {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-gray-900 text-xl">Health Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <div className="space-y-6 relative">
            <div className="absolute left-5 top-2 h-full w-0.5 bg-gray-200" />
            {events.map(event => {
              const {icon: Icon, color} = timelineIcons[event.type];
              return (
                <div key={event.id} className="flex gap-4 items-start pl-0 relative">
                    <div className="absolute left-5 -translate-x-1/2 mt-1.5 z-10 bg-background p-1 rounded-full">
                      <div className={cn('p-2 rounded-full', color.replace('text-', 'bg-') + '/20')}>
                        <Icon className={cn('w-5 h-5', color)} />
                      </div>
                    </div>
                    <div className="pl-12 w-full">
                      <div className="flex justify-between items-center">
                          <p className="font-bold text-gray-900">{event.title}</p>
                          <p className="text-xs text-gray-500">{format(new Date(event.timestamp), 'MMM d, yyyy')}</p>
                      </div>
                      <p className="text-sm text-gray-700">{event.notes}</p>
                    </div>
                </div>
              )
            })}
          </div>
        ) : (
           <p className="text-gray-500 text-center py-4">No health events logged yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function VitalsChart({ data }: { data: { date: string, weight: number }[] }) {
  if (data.length < 2) return null;
  const formattedData = data.map(d => ({...d, date: format(new Date(d.date), 'MMM')}));
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-gray-900 text-xl">Weight Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip contentStyle={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))' }}/>
            <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function EncouragementCard() {
  return (
    <Card className="rounded-2xl shadow-md bg-mint-green/30 animate-glow">
      <CardContent className="p-6 flex items-center gap-4">
        <Sparkles className="w-8 h-8 text-mint-green" />
        <div>
          <p className="font-bold text-gray-900">Great Job!</p>
          <p className="text-sm text-gray-700">Your pet's health is in tip-top shape. Keep up the amazing care!</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HealthPage() {
  const { userId, petId } = useAuth();
  const { healthLogs, loading: healthLogsLoading } = useHealthLogs(userId, petId);
  const { reminders, loading: remindersLoading } = useReminders(userId, petId);
  const loading = healthLogsLoading || remindersLoading;

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { healthScore, weightTrend } = useMemo(() => {
    if (!isClient) return { healthScore: 0, weightTrend: [] };

    const lastVetVisitLog = healthLogs.find(log => log.type === 'vet-visit');
    const lastWeightLog = healthLogs.find(log => log.type === 'weight');

    const lastVisitDays = lastVetVisitLog ? differenceInDays(new Date(), new Date(lastVetVisitLog.timestamp)) : 999;
    const lastWeightDays = lastWeightLog ? differenceInDays(new Date(), new Date(lastWeightLog.timestamp)) : 999;
    
    let score = 0;
    if (lastVisitDays < 180) score += 50; // within 6 months
    else if (lastVisitDays < 365) score += 25;

    if (lastWeightDays < 30) score += 50; // within 1 month
    else if (lastWeightDays < 90) score += 25;
    
    const trend = healthLogs
      .filter(log => log.type === 'weight' && typeof log.value === 'number')
      .map(log => ({ date: new Date(log.timestamp).toISOString(), weight: log.value as number }))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { healthScore: Math.min(score, 100), weightTrend: trend };
  }, [isClient, healthLogs]);

  if (loading && isClient) {
      return (
         <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <Skeleton className="h-10 w-1/3 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 mt-2 rounded-lg" />
                </header>
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-80 w-full rounded-2xl" />
                        <Skeleton className="h-72 w-full rounded-2xl" />
                    </div>
                </main>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <h1 className="font-headline text-3xl font-bold text-gray-900">Health Overview</h1>
            <p className="text-gray-700">Key health metrics, history, and reminders.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
               <VitalsChart data={weightTrend} />
               <HealthTimeline events={healthLogs} />
            </div>
             <div className="lg:col-span-1 space-y-6">
                <HealthProgressRing score={healthScore} />
                {healthScore >= 80 && isClient && <EncouragementCard />}
                <RemindersCard reminders={reminders} />
             </div>
        </main>
      </div>
    </div>
  );
}
