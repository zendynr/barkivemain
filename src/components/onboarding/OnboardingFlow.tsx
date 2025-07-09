'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { addPetProfile } from '@/lib/firebase/firestore';
import { uploadPetAvatar } from '@/lib/firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Dog, Cat, Bird, Rabbit, Bone, Rocket, Sofa, Weight, Cake, Upload, Sparkles, PawPrint, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pet } from '@/lib/types';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });


type OnboardingData = Omit<Pet, 'id'>;

const speciesIcons = {
    Dog: Dog,
    Cat: Cat,
    Rabbit: Rabbit,
    Bird: Bird,
    Other: PawPrint
};

const activityIcons = {
    'Couch Potato': Sofa,
    'Playful': Bone,
    'Hyperactive': Rocket
};

const defaultPetData: OnboardingData = {
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 5,
    weight: 30,
    activityLevel: 'Playful',
    avatarUrl: 'https://placehold.co/128x128.png',
};

export function OnboardingFlow() {
  const router = useRouter();
  const { toast } = useToast();
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>(defaultPetData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(formData.avatarUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const totalSteps = 7;

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!userId || !formData.name || !formData.species || !formData.breed || formData.age === undefined || formData.weight === undefined || !formData.activityLevel) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please complete all fields before submitting.' });
        return;
    }

    setIsSubmitting(true);
    try {
        let avatarUrl = formData.avatarUrl || defaultPetData.avatarUrl;
        if (avatarFile) {
            avatarUrl = await uploadPetAvatar(userId, avatarFile);
        }

        const finalData: OnboardingData = {
            name: formData.name,
            species: formData.species,
            breed: formData.breed,
            age: formData.age,
            weight: formData.weight,
            activityLevel: formData.activityLevel,
            avatarUrl: avatarUrl,
        };

        await addPetProfile(userId, finalData);
        setShowConfetti(true);
        setTimeout(() => {
          toast({ title: 'Welcome!', description: `${formData.name} has been added to your pack.` });
          router.push('/');
        }, 3000); // Let confetti run for a bit
    } catch (error: any) {
        console.error("Failed to create pet profile:", error);
        let description = 'Could not save pet profile. Please try again.';
        if (error.code) {
          switch (error.code) {
            case 'permission-denied':
            case 'unauthenticated':
              description = 'Please check your Firestore security rules. You may not have permission to write data.';
              break;
            case 'failed-precondition':
              description = 'A backend service is not enabled. Please ensure Firestore and Storage are enabled in your Firebase project console.';
              break;
          }
        }
        toast({ variant: 'destructive', title: 'Submission Error', description });
        setIsSubmitting(false);
    }
  };

  const steps = [
    // Welcome
    <WelcomeScreen onNext={handleNext} />,
    // Name
    <Step title="What's your pet's name?">
      <Input
        placeholder="e.g. Buddy"
        value={formData.name}
        onChange={e => updateFormData('name', e.target.value)}
        className="text-center text-2xl h-14"
      />
      <p className="text-gray-600 mt-4 text-xl">My name is: <span className="font-bold">{formData.name || '...'}</span></p>
    </Step>,
    // Species
    <Step title="What kind of pet are they?">
        <div className="grid grid-cols-2 gap-4">
            {(Object.keys(speciesIcons) as (keyof typeof speciesIcons)[]).map(species => {
                const Icon = speciesIcons[species];
                return (
                    <Card
                        key={species}
                        onClick={() => { updateFormData('species', species); handleNext(); }}
                        className={`p-4 text-center cursor-pointer transition-all duration-200 ${formData.species === species ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:shadow-md'}`}
                    >
                        <Icon className="w-12 h-12 mx-auto text-gray-700" />
                        <p className="mt-2 font-semibold">{species}</p>
                    </Card>
                )
            })}
        </div>
    </Step>,
    // Breed & Age
    <Step title="Tell us a bit more.">
        <div className="space-y-6">
            <div>
                <label className="font-semibold text-gray-700">Breed</label>
                <Input placeholder="e.g. Golden Retriever" value={formData.breed} onChange={e => updateFormData('breed', e.target.value)} />
            </div>
            <div>
                 <label className="font-semibold text-gray-700">Age: <span className="text-primary font-bold">{formData.age} years</span></label>
                <Slider defaultValue={[5]} value={[formData.age || 5]} max={30} step={1} onValueChange={([val]) => updateFormData('age', val)} />
            </div>
        </div>
    </Step>,
    // Weight
    <Step title="How much do they weigh?">
        <div className="flex flex-col items-center gap-4">
            <Weight className="w-16 h-16 text-gray-400" />
            <p className="text-3xl font-bold">{formData.weight} kg</p>
            <Slider defaultValue={[30]} value={[formData.weight || 30]} max={100} step={1} onValueChange={([val]) => updateFormData('weight', val)} />
        </div>
    </Step>,
    // Activity Level
    <Step title="What's their energy level?">
        <div className="grid grid-cols-1 gap-4">
            {(Object.keys(activityIcons) as (keyof typeof activityIcons)[]).map(level => {
                const Icon = activityIcons[level];
                return (
                     <Card
                        key={level}
                        onClick={() => { updateFormData('activityLevel', level); handleNext(); }}
                        className={`p-4 cursor-pointer transition-all duration-200 flex items-center gap-4 ${formData.activityLevel === level ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}
                    >
                        <Icon className="w-8 h-8 text-gray-700" />
                        <p className="font-semibold">{level}</p>
                    </Card>
                )
            })}
        </div>
    </Step>,
    // Avatar
    <Step title="Upload a profile picture!">
        <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
                <AvatarImage src={avatarPreview || undefined} alt="Pet avatar" />
                <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button asChild variant="outline">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Photo
                     <input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} />
                </label>
            </Button>
            <Button variant="ghost" onClick={handleNext}>Skip for now</Button>
        </div>
    </Step>,
    // Review
    <Step title="Does this look right?">
        <Card className="p-4 shadow-lg">
            <CardContent className="flex items-center gap-4 p-0">
                 <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview || undefined} alt={formData.name} />
                    <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-xl">{formData.name}</h3>
                    <p className="text-gray-600">{formData.breed}</p>
                    <div className="flex gap-4 text-sm mt-2">
                        <span className="flex items-center gap-1"><Cake className="w-4 h-4" /> {formData.age} yrs</span>
                        <span className="flex items-center gap-1"><Weight className="w-4 h-4" /> {formData.weight} kg</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </Step>
  ];

  if(showConfetti) {
      return (
          <div className="w-full max-w-md text-center">
              {showConfetti && <ReactConfetti recycle={false} numberOfPieces={300} />}
              <Sparkles className="w-24 h-24 mx-auto text-yellow-400 animate-pulse"/>
              <h2 className="text-3xl font-bold mt-4">All set!</h2>
              <p className="text-lg text-gray-700 mt-2">{formData.name} is ready for their journey!</p>
          </div>
      )
  }

  return (
    <Card className="w-full max-w-md p-2 sm:p-4 shadow-2xl bg-white/70 backdrop-blur-sm">
        <div className="h-1.5 w-full bg-gray-200 rounded-full mb-4">
            <motion.div 
                className="h-1.5 bg-primary rounded-full"
                animate={{ width: `${(currentStep / totalSteps) * 100}%`}}
                transition={{ ease: "easeInOut", duration: 0.5 }}
            />
        </div>
        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
                className="p-4"
            >
                {steps[currentStep]}
            </motion.div>
        </AnimatePresence>
        <div className="flex justify-between items-center p-4 border-t">
            <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 0 || isSubmitting}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {currentStep < totalSteps ? (
                 <Button onClick={handleNext} disabled={currentStep === totalSteps}>
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Finish Setup'}
                </Button>
            )}
        </div>
    </Card>
  );
}

function WelcomeScreen({onNext}: {onNext: () => void}) {
    return (
        <div className="text-center py-8">
            <PawPrint className="w-20 h-20 mx-auto text-primary animate-bounce" />
            <h2 className="text-3xl font-bold mt-4">Let's meet your best friend!</h2>
            <p className="text-gray-600 mt-2">Create a profile to track their life.</p>
            <Button size="lg" className="mt-6" onClick={onNext}>
                Start Setup
            </Button>
        </div>
    )
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 min-h-[300px]">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </div>
  );
}
