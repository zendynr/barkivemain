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

// This data is now considered mock. In a real app, this would come from Firestore.
const healthData = {
  vitals: {
    weight: 30, // in kg
    temperature: 38.5, // in Celsius
    lastVetVisit: '2024-05-20',
  },
  reminders: [
    { id: 1, type: 'vaccination', name: 'Rabies', due: '2025-01-15' },
    { id: 2, type: 'vaccination', name: 'DHPP', due: '2027-01-15' },
    { id: 3, type: 'appointment', name: 'Annual Checkup', due: '2024-08-01' },
    { id: 4, type: 'grooming', name: 'Full Groom', due: '2024-07-20' },
  ],
  timeline: [
    { id: 1, type: 'vet-visit', date: '2024-05-20', title: 'Annual Checkup', notes: 'All clear, healthy check-up.' },
    { id: 2, type: 'vaccination', date: '2024-01-15', title: 'Rabies & DHPP', notes: 'Booster shots administered.' },
    { id: 3, type: 'grooming', date: '2024-06-15', title: 'Summer Cut', notes: 'Feeling fresh and clean.' },
    { id: 4, type: 'weight', date: '2024-5-20', title: 'Weigh-in', notes: 'Stable weight at 30kg.' },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  weightTrend: [
    { date: '2024-01-01', weight: 29.5 },
    { date: '2024-02-01', weight: 29.7 },
    { date: '2024-03-01', weight: 30.1 },
    { date: '2024-04-01', weight: 30.0 },
    { date: '2024-05-01', weight: 29.9 },
    { date: '2024-06-01', weight: 30.0 },
  ],
};

const reminderIcons = {
  vaccination: { icon: Syringe, color: 'text-mint-green' },
  appointment: { icon: Stethoscope, color: 'text-coral-blush' },
  grooming: { icon: Scissors, color: 'text-lavender' },
  medication: { icon: Pill, color: 'text-yellow-500' },
};

const timelineIcons = {
  'vet-visit': { icon: Stethoscope, color: 'text-coral-blush' },
  vaccination: { icon: Syringe, color: 'text-mint-green' },
  grooming: { icon: Scissors, color: 'text-lavender' },
  weight: { icon: Weight, color: 'text-blue-500' },
  temperature: { icon: Thermometer, color: 'text-orange-500' },
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

function RemindersCard({ reminders }: { reminders: typeof healthData.reminders }) {
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
        <Accordion type="single" collapsible className="w-full">
          {reminders.map((reminder) => {
            const { icon: Icon, color } = reminderIcons[reminder.type as keyof typeof reminderIcons] || reminderIcons.medication;
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
                      <p className={cn("text-sm", isOverdue ? "text-destructive" : "text-gray-600")}>
                        Due: {formatDistanceToNow(dueDate, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 pl-12">Set a reminder for {format(dueDate, 'PPP')}.</p>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function HealthTimeline({ events }: { events: typeof healthData.timeline }) {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-gray-900 text-xl">Health Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 relative">
          <div className="absolute left-5 top-2 h-full w-0.5 bg-gray-200" />
          {events.map(event => {
            const {icon: Icon, color} = timelineIcons[event.type as keyof typeof timelineIcons];
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
                        <p className="text-xs text-gray-500">{format(new Date(event.date), 'MMM d, yyyy')}</p>
                     </div>
                     <p className="text-sm text-gray-700">{event.notes}</p>
                  </div>
               </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function VitalsChart({ data }: { data: typeof healthData.weightTrend }) {
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
          <p className="text-sm text-gray-700">Buddy's health is in tip-top shape. Keep up the amazing care!</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HealthPage() {
  // Data is now fetched from hooks, but for now we keep the mock data for display
  // In a real implementation, you'd use useHealthLogs() and usePetProfile()
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const healthScore = useMemo(() => {
    if (!isClient) return 0;
    const lastVisitDays = differenceInDays(new Date(), new Date(healthData.vitals.lastVetVisit));
    const lastWeightDays = differenceInDays(new Date(), new Date(healthData.weightTrend[healthData.weightTrend.length - 1].date));
    
    let score = 0;
    if (lastVisitDays < 180) score += 50; // within 6 months
    else if (lastVisitDays < 365) score += 25;

    if (lastWeightDays < 30) score += 50; // within 1 month
    else if (lastWeightDays < 90) score += 25;
    
    return Math.min(score, 100);
  }, [isClient]);

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
               <VitalsChart data={healthData.weightTrend} />
               <HealthTimeline events={healthData.timeline} />
            </div>
             <div className="lg:col-span-1 space-y-6">
                <HealthProgressRing score={healthScore} />
                {healthScore >= 80 && isClient && <EncouragementCard />}
                <RemindersCard reminders={healthData.reminders} />
             </div>
        </main>
      </div>
    </div>
  );
}
