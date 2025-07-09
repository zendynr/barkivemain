'use client';

import { useState } from 'react';
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
  DialogTrigger,
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
import { PlusCircle, UtensilsCrossed, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  foodType: z.enum(['Kibble', 'Wet Food', 'Treat', 'Other']),
  quantity: z.string().min(1, 'Quantity is required.'),
  notes: z.string().optional(),
});

function AddFeedingDialog({ onAddFeeding, children }: { onAddFeeding: (newLog: Omit<FeedingLog, 'id' | 'timestamp'>) => void; children: React.ReactNode; }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodType: 'Kibble',
      quantity: '',
      notes: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddFeeding({
      ...values,
      foodType: values.foodType as FeedingLog['foodType'],
    });
    toast({
      title: 'Success!',
      description: `Logged ${values.quantity} of ${values.foodType}.`,
    });
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
      {sortedLogs.map((log) => (
        <Card key={log.id} className="rounded-2xl shadow-sm animate-in fade-in-50 duration-300">
          <CardContent className="p-4 flex items-start justify-between">
            <div className="flex-1">
              <p className="font-bold text-lg text-gray-900">{log.foodType}</p>
              <p className="text-gray-700">{log.quantity}</p>
              {log.notes && <p className="text-sm text-gray-500 mt-2 italic">"{log.notes}"</p>}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 ml-4 pt-1">
              <Clock className="w-4 h-4" />
              <span>
                {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function FeedingPage() {
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>(initialFeedingLogs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddFeeding = (newLogData: Omit<FeedingLog, 'id' | 'timestamp'>) => {
    const newLog: FeedingLog = {
      ...newLogData,
      id: `feed${Date.now()}`,
      timestamp: new Date(),
    };
    setFeedingLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold text-gray-900">Feeding History</h1>
            <p className="text-gray-700">A log of all your pet's meals and treats.</p>
          </div>
          {feedingLogs.length > 0 && (
             <AddFeedingDialog onAddFeeding={handleAddFeeding}>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 rounded-full shadow-sm">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Feeding
              </Button>
            </AddFeedingDialog>
          )}
        </header>

        <main>
          <FeedingList logs={feedingLogs} onAdd={() => setIsDialogOpen(true)} />
        </main>
      </div>
    </div>
  );
}
