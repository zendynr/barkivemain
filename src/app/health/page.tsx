
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Pencil, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import {
  HeartPulse, Weight, Thermometer, Pill, PlusCircle, Stethoscope, Scissors, Syringe, Sparkles, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useHealthLogs } from '@/hooks/use-health-logs';
import { useReminders } from '@/hooks/use-reminders';
import { addHealthLog, addReminder, deleteReminder, updateHealthLog, updateReminder, deleteHealthLog } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { HealthLog, Reminder } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


// --- Dialog and Forms ---
const logSchema = z.object({
  type: z.enum(['vet-visit', 'vaccination', 'grooming', 'weight', 'temperature', 'medication']),
  title: z.string().min(1, 'Title is required.'),
  notes: z.string().optional(),
  timestamp: z.date(),
  value: z.string().optional(),
});

const reminderSchema = z.object({
  type: z.enum(['vaccination', 'appointment', 'grooming', 'medication']),
  name: z.string().min(1, 'Name is required.'),
  due: z.date(),
  notes: z.string().optional(),
});

type EventData = HealthLog | Reminder;

function AddHealthEventDialog({ open, onOpenChange, onSave, initialData }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSave: (data: z.infer<typeof logSchema> | z.infer<typeof reminderSchema>, id?: string) => Promise<void>;
  initialData: EventData | null;
}) {
  const isEditing = !!initialData;
  const isLog = !initialData || 'timestamp' in initialData;

  const logForm = useForm<z.infer<typeof logSchema>>({
    resolver: zodResolver(logSchema),
    defaultValues: { type: 'vet-visit', title: '', notes: '', timestamp: new Date(), value: '' },
  });

  const reminderForm = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { type: 'appointment', name: '', due: new Date(), notes: '' },
  });

  useEffect(() => {
    if (initialData) {
      if ('timestamp' in initialData) { // It's a HealthLog
        logForm.reset({
          type: initialData.type,
          title: initialData.title,
          notes: initialData.notes || '',
          timestamp: new Date(initialData.timestamp),
          value: initialData.value?.toString() || '',
        });
      } else { // It's a Reminder
        reminderForm.reset({
          type: initialData.type,
          name: initialData.name,
          notes: initialData.notes || '',
          due: new Date(initialData.due),
        });
      }
    } else {
      logForm.reset({ type: 'vet-visit', title: '', notes: '', timestamp: new Date(), value: '' });
      reminderForm.reset({ type: 'appointment', name: '', due: new Date(), notes: '' });
    }
  }, [initialData, logForm, reminderForm]);


  const handleLogSubmit = async (values: z.infer<typeof logSchema>) => {
    await onSave(values, initialData?.id);
    onOpenChange(false);
  };
  
  const handleReminderSubmit = async (values: z.infer<typeof reminderSchema>) => {
    await onSave(values, initialData?.id);
    onOpenChange(false);
  };

  const currentTab = isEditing ? (isLog ? 'log' : 'reminder') : 'log';
  const TabsValue = ({ value, children }: { value: string; children: React.ReactNode }) => isEditing ? (value === currentTab ? <>{children}</> : null) : <TabsContent value={value}>{children}</TabsContent>;
  const FormComponent = isLog ? logForm : reminderForm;
  const handleSubmit = isLog ? handleLogSubmit : handleReminderSubmit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Add'} Health Event</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={currentTab} className="w-full">
          {!isEditing && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="log">Log Event</TabsTrigger>
              <TabsTrigger value="reminder">Set Reminder</TabsTrigger>
            </TabsList>
          )}

          <TabsValue value="log">
            <Form {...logForm}>
              <form onSubmit={logForm.handleSubmit(handleLogSubmit)} className="space-y-4 pt-4">
                <FormField control={logForm.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.keys(timelineIcons).map(key => <SelectItem key={key} value={key}>{key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}/>
                <FormField control={logForm.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 {(logForm.watch('type') === 'weight' || logForm.watch('type') === 'temperature') && (
                  <FormField control={logForm.control} name="value" render={({ field }) => (
                    <FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                 )}
                <FormField control={logForm.control} name="timestamp" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Date</FormLabel>
                    <Popover><PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent></Popover>
                  <FormMessage /></FormItem>
                )}/>
                <FormField control={logForm.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )}/>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                  <Button type="submit">{isEditing ? 'Save Changes' : 'Save Log'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsValue>

          <TabsValue value="reminder">
            <Form {...reminderForm}>
              <form onSubmit={reminderForm.handleSubmit(handleReminderSubmit)} className="space-y-4 pt-4">
                <FormField control={reminderForm.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                       <SelectContent>
                          {Object.keys(reminderIcons).map(key => <SelectItem key={key} value={key}>{key.replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                       </SelectContent>
                    </Select>
                  </FormItem>
                )}/>
                <FormField control={reminderForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={reminderForm.control} name="due" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Due Date</FormLabel>
                    <Popover><PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent></Popover>
                  <FormMessage /></FormItem>
                )}/>
                 <FormField control={reminderForm.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )}/>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                  <Button type="submit">{isEditing ? 'Save Changes' : 'Set Reminder'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsValue>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// --- Cards and Components ---

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

function RemindersCard({ reminders, onEdit, onDelete }: { reminders: Reminder[]; onEdit: (reminder: Reminder) => void; onDelete: (id: string, type: 'reminder') => void; }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-gray-900 text-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-lavender" />
            Reminders
          </div>
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
                    <div className="pl-12 space-y-4">
                        {reminder.notes && <p className="text-gray-700 text-sm">Notes: {reminder.notes}</p>}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onEdit(reminder)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                          </Button>
                           <Button size="sm" variant="destructive" onClick={() => onDelete(reminder.id, 'reminder')}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                          </Button>
                        </div>
                    </div>
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

function HealthTimeline({ events, onEdit, onDelete }: { events: HealthLog[]; onEdit: (log: HealthLog) => void; onDelete: (id: string, type: 'log') => void; }) {
  const sortedEvents = [...events].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-gray-900 text-xl">Health Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length > 0 ? (
          <div className="space-y-6 relative">
            <div className="absolute left-5 top-2 h-full w-0.5 bg-gray-200" />
            {sortedEvents.map(event => {
              const {icon: Icon, color} = timelineIcons[event.type];
              return (
                <div key={event.id} className="group flex gap-4 items-start pl-0 relative">
                    <div className="absolute left-5 -translate-x-1/2 mt-1.5 z-10 bg-background p-1 rounded-full">
                      <div className={cn('p-2 rounded-full', color.replace('text-', 'bg-') + '/20')}>
                        <Icon className={cn('w-5 h-5', color)} />
                      </div>
                    </div>
                    <div className="pl-12 w-full">
                      <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900">{event.title}</p>
                            <p className="text-xs text-gray-500">{format(new Date(event.timestamp), 'MMM d, yyyy')}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(event)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(event.id, 'log')}><Trash2 className="w-4 h-4" /></Button>
                          </div>
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

// --- Main Page Component ---
export default function HealthPage() {
  const { userId, petId } = useAuth();
  const { healthLogs, loading: healthLogsLoading } = useHealthLogs(userId, petId);
  const { reminders, loading: remindersLoading } = useReminders(userId, petId);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{id: string, type: 'log' | 'reminder'} | null>(null);

  const { toast } = useToast();
  
  const loading = healthLogsLoading || remindersLoading;

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleOpenDialog = (event: EventData | null = null) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
    setEditingEvent(null);
    setIsDialogOpen(false);
  }

  const handleSaveEvent = async (data: z.infer<typeof logSchema> | z.infer<typeof reminderSchema>, id?: string) => {
    if (!userId || !petId) return;
    try {
      if ('timestamp' in data) { // It's a HealthLog
        const logData = { ...data, value: data.value ? parseFloat(data.value) : undefined };
        if (id) {
          await updateHealthLog(userId, petId, id, logData);
          toast({ title: 'Success', description: 'Health event updated.' });
        } else {
          await addHealthLog(userId, petId, logData);
          toast({ title: 'Success', description: 'Health event logged.' });
        }
      } else { // It's a Reminder
        if (id) {
          await updateReminder(userId, petId, id, data);
          toast({ title: 'Success', description: 'Reminder updated.' });
        } else {
          await addReminder(userId, petId, data);
          toast({ title: 'Success', description: 'Reminder set.' });
        }
      }
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save event.' });
    }
  };

  const handleDeleteRequest = (id: string, type: 'log' | 'reminder') => {
    setEventToDelete({ id, type });
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!userId || !petId || !eventToDelete) return;

    try {
      if (eventToDelete.type === 'log') {
        await deleteHealthLog(userId, petId, eventToDelete.id);
        toast({ title: 'Success', description: 'Health log deleted.' });
      } else {
        await deleteReminder(userId, petId, eventToDelete.id);
        toast({ title: 'Success', description: 'Reminder deleted.' });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete event.' });
    } finally {
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  }


  const { healthScore, weightTrend } = useMemo(() => {
    if (!isClient) return { healthScore: 0, weightTrend: [] };

    const lastVetVisitLog = healthLogs.find(log => log.type === 'vet-visit');
    const lastWeightLog = healthLogs.find(log => log.type === 'weight');

    const lastVisitDays = lastVetVisitLog ? differenceInDays(new Date(), new Date(lastVetVisitLog.timestamp)) : 999;
    const lastWeightDays = lastWeightLog ? differenceInDays(new Date(), new Date(lastWeightLog.timestamp)) : 999;
    
    let score = 0;
    if (lastVisitDays < 180) score += 50;
    else if (lastVisitDays < 365) score += 25;

    if (lastWeightDays < 30) score += 50;
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
       <AddHealthEventDialog 
          open={isDialogOpen} 
          onOpenChange={handleCloseDialog} 
          onSave={handleSaveEvent}
          initialData={editingEvent}
      />

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-headline text-3xl font-bold text-gray-900">Health Overview</h1>
              <p className="text-gray-700">Key health metrics, history, and reminders.</p>
            </div>
             <Button onClick={() => handleOpenDialog()} className="rounded-full shadow-sm">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Event
            </Button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
               <VitalsChart data={weightTrend} />
               <HealthTimeline events={healthLogs} onEdit={handleOpenDialog} onDelete={handleDeleteRequest} />
            </div>
             <div className="lg:col-span-1 space-y-6">
                <HealthProgressRing score={healthScore} />
                {healthScore >= 80 && isClient && <EncouragementCard />}
                <RemindersCard reminders={reminders} onEdit={handleOpenDialog} onDelete={handleDeleteRequest} />
             </div>
        </main>
      </div>
    </div>
  );
}
