'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Star, PlusCircle, Upload, Camera as CameraIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMemories } from '@/hooks/use-memories';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addMemory } from '@/lib/firebase/firestore';
import { uploadMemoryImage } from '@/lib/firebase/storage';
import type { Memory } from '@/lib/types';


const formSchema = z.object({
  caption: z.string().min(1, 'Caption is required.'),
  image: z.instanceof(File).refine(file => file.size > 0, 'An image is required.'),
  aiHint: z.string().optional(),
});

function AddMemoryDialog({ open, onOpenChange, onAddMemory }: { open: boolean; onOpenChange: (open: boolean) => void; onAddMemory: (data: z.infer<typeof formSchema>) => Promise<void> }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caption: '',
      aiHint: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        form.setValue('image', file, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await onAddMemory(values);
      toast({
        title: 'Memory Added!',
        description: 'Your new memory has been saved to the gallery.',
      });
      onOpenChange(false);
      form.reset();
      setPreview(null);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not save your memory. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset();
      setPreview(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Memory</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                   <FormControl>
                      <div className="flex flex-col items-center gap-4">
                        {preview ? (
                          <Image src={preview} alt="Memory preview" width={200} height={200} className="rounded-lg object-cover" />
                        ) : (
                          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                            <CameraIcon className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                         <Button asChild variant="outline" size="sm">
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Image
                            <input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                          </label>
                        </Button>
                      </div>
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What's happening in this moment?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aiHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Hint (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 'dog running'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Memory'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default function MemoriesPage() {
  const { userId, petId } = useAuth();
  const { memories, loading } = useMemories(userId, petId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddMemory = async (data: z.infer<typeof formSchema>) => {
     if (!userId || !petId) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No active pet selected.',
      });
      throw new Error("User or pet not available");
    }
    const imageUrl = await uploadMemoryImage(userId, petId, data.image);
    
    const memoryData: Omit<Memory, 'id' | 'timestamp'> = {
      caption: data.caption,
      imageUrl: imageUrl,
    };

    if (data.aiHint && data.aiHint.trim() !== '') {
      memoryData.aiHint = data.aiHint;
    }

    await addMemory(userId, petId, memoryData);
  }

  const sortedMemories = [...memories].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const featuredMemory = sortedMemories[0];
  const otherMemories = sortedMemories.slice(1);

  if (loading) {
    return (
       <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <Skeleton className="h-10 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-64 mt-2 rounded-lg" />
                </div>
                 <Skeleton className="h-12 w-36 rounded-full" />
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

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <AddMemoryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onAddMemory={handleAddMemory} />
         <header className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="font-headline text-3xl font-bold text-gray-900">Memories</h1>
                <p className="text-gray-700">A gallery of your favorite moments.</p>
            </div>
             <Button onClick={() => setIsDialogOpen(true)} className="rounded-full shadow-sm">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Memory
            </Button>
        </header>

         {memories.length === 0 && !loading ? (
             <div className="text-center py-20 flex flex-col items-center gap-4 bg-gray-50/50 rounded-2xl border border-dashed">
                <CameraIcon className="w-16 h-16 text-gray-400" />
                <h3 className="font-headline text-2xl font-semibold text-gray-800">Your pet's album is empty</h3>
                <p className="text-gray-600 max-w-xs mx-auto">Add your first memory to start capturing the precious moments.</p>
                <Button size="lg" onClick={() => setIsDialogOpen(true)} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 rounded-full shadow-lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add First Memory
                </Button>
              </div>
         ) : (
            <>
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
                                    {isClient && <p className="text-gray-200 text-sm">{new Date(featuredMemory.timestamp).toLocaleDateString()}</p>}
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
                                        {isClient && <p className="text-xs text-gray-500">
                                        {new Date(memory.timestamp).toLocaleDateString()}
                                        </p>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </>
        )}
      </div>
    </div>
  );
}
