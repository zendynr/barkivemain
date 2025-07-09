'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { addPetProfile } from '@/lib/firebase/firestore';
import { uploadPetAvatar } from '@/lib/firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Dog, Cat, Bird, Rabbit, Bone, Rocket, Sofa, Weight, Cake, Upload, Sparkles, PawPrint, ChevronLeft, ChevronRight, Scale, Dumbbell, Clock, Info } from 'lucide-react';
import type { Pet } from '@/lib/types';
import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { dogBreeds, catBreeds, otherBreeds } from '@/lib/data/breeds';


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
    nickname: '',
    feedingSchedule: ['morning', 'evening'],
    trainingGoal: 60,
    unitPreference: 'metric',
    isFirstPet: true,
    favoriteFoods: [],
    allergies: '',
};

const feedingScheduleOptions = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
] as const;

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
  const [tempFavFoods, setTempFavFoods] = useState('');
  const [breedSuggestions, setBreedSuggestions] = useState<(typeof dogBreeds)>([]);

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

  const handleFeedingScheduleChange = (checked: boolean, scheduleId: 'morning' | 'afternoon' | 'evening') => {
    const currentSchedule = formData.feedingSchedule || [];
    if (checked) {
      if (!currentSchedule.includes(scheduleId)) {
        updateFormData('feedingSchedule', [...currentSchedule, scheduleId]);
      }
    } else {
      updateFormData('feedingSchedule', currentSchedule.filter(id => id !== scheduleId));
    }
  }

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
            nickname: formData.nickname,
            feedingSchedule: formData.feedingSchedule,
            trainingGoal: formData.trainingGoal,
            unitPreference: formData.unitPreference,
            isFirstPet: formData.isFirstPet,
            favoriteFoods: tempFavFoods.split(',').map(s => s.trim()).filter(Boolean),
            allergies: formData.allergies,
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

  const breeds = useMemo(() => {
    switch (formData.species) {
      case 'Dog':
        return dogBreeds;
      case 'Cat':
        return catBreeds;
      default:
        return otherBreeds;
    }
  }, [formData.species]);

  const handleSpeciesChange = (species: keyof typeof speciesIcons) => {
    updateFormData('species', species);
    updateFormData('breed', ''); // Reset breed when species changes
    setBreedSuggestions([]); // Clear suggestions
  };

  const handleBreedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateFormData('breed', value);

    if (value && breeds.length > 1) {
      const filteredBreeds = breeds.filter(breed => 
        breed.label.toLowerCase().includes(value.toLowerCase())
      );
      setBreedSuggestions(filteredBreeds.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setBreedSuggestions([]);
    }
  };
  
  const handleSuggestionClick = (breedLabel: string) => {
    updateFormData('breed', breedLabel);
    setBreedSuggestions([]);
  };

  const steps = [
    // Welcome
    <WelcomeScreen onNext={handleNext} />,
    // Primary Info
    <Step title="Let's start with the basics.">
        <div className="space-y-6 w-full">
            <div>
                <Label htmlFor="name">Pet's Name</Label>
                <Input id="name" placeholder="e.g. Buddy" value={formData.name} onChange={e => updateFormData('name', e.target.value)} />
            </div>
            <div>
                 <Label>Species</Label>
                 <div className="grid grid-cols-3 gap-2 pt-2">
                    {(Object.keys(speciesIcons) as (keyof typeof speciesIcons)[]).map(species => {
                        const Icon = speciesIcons[species];
                        return (
                            <Card
                                key={species}
                                onClick={() => handleSpeciesChange(species)}
                                className={`p-2 text-center cursor-pointer transition-all duration-200 ${formData.species === species ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'}`}
                            >
                                <Icon className="w-8 h-8 mx-auto text-gray-700" />
                                <p className="mt-1 text-xs font-semibold">{species}</p>
                            </Card>
                        )
                    })}
                </div>
            </div>
            <div>
                <Label htmlFor="breed">Breed</Label>
                 <div className="relative">
                    <Input
                        id="breed"
                        placeholder="e.g. Golden Retriever"
                        value={formData.breed}
                        onChange={handleBreedChange}
                        onBlur={() => setTimeout(() => setBreedSuggestions([]), 100)}
                        autoComplete="off"
                    />
                    {breedSuggestions.length > 0 && (
                        <Card className="absolute z-10 w-full mt-1 bg-background shadow-lg border">
                            <CardContent className="p-1">
                                {breedSuggestions.map(breed => (
                                <div
                                    key={breed.value}
                                    className="px-3 py-2 text-sm text-left cursor-pointer hover:bg-accent rounded-md"
                                    onMouseDown={() => handleSuggestionClick(breed.label)}
                                >
                                    {breed.label}
                                </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    </Step>,
    // Vitals
    <Step title="Tell us about their vitals.">
        <div className="space-y-6 w-full">
            <div>
                 <Label>Age: <span className="text-primary font-bold">{formData.age} years</span></Label>
                <Slider defaultValue={[5]} value={[formData.age || 5]} max={30} step={1} onValueChange={([val]) => updateFormData('age', val)} />
            </div>
            <div>
                 <Label>Weight: <span className="text-primary font-bold">{formData.weight} {formData.unitPreference === 'metric' ? 'kg' : 'lbs'}</span></Label>
                <Slider defaultValue={[30]} value={[formData.weight || 30]} max={100} step={1} onValueChange={([val]) => updateFormData('weight', val)} />
            </div>
             <div>
                <Label>Units</Label>
                <RadioGroup
                    defaultValue="metric"
                    value={formData.unitPreference}
                    onValueChange={(val) => updateFormData('unitPreference', val)}
                    className="flex gap-4 pt-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="metric" id="metric" />
                        <Label htmlFor="metric">Metric (kg)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="imperial" id="imperial" />
                        <Label htmlFor="imperial">Imperial (lbs)</Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    </Step>,
    // Lifestyle
    <Step title="What's their lifestyle like?">
        <div className="space-y-6 w-full">
            <div>
                <Label>Energy Level</Label>
                <div className="grid grid-cols-1 gap-2 pt-2">
                    {(Object.keys(activityIcons) as (keyof typeof activityIcons)[]).map(level => {
                        const Icon = activityIcons[level];
                        return (
                            <Card
                                key={level}
                                onClick={() => updateFormData('activityLevel', level)}
                                className={`p-3 cursor-pointer transition-all duration-200 flex items-center gap-4 ${formData.activityLevel === level ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'}`}
                            >
                                <Icon className="w-6 h-6 text-gray-700" />
                                <p className="font-semibold text-sm">{level}</p>
                            </Card>
                        )
                    })}
                </div>
            </div>
             <div>
                <Label>Feeding Schedule</Label>
                 <div className="flex flex-col gap-2 pt-2">
                  {feedingScheduleOptions.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                       <Checkbox
                        id={item.id}
                        checked={(formData.feedingSchedule || []).includes(item.id)}
                        onCheckedChange={(checked) => handleFeedingScheduleChange(!!checked, item.id)}
                      />
                      <label htmlFor={item.id} className="text-sm font-medium leading-none">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
            </div>
        </div>
    </Step>,
    // Goals
    <Step title="Set a weekly training goal">
      <div className="flex flex-col items-center gap-4 w-full">
        <Dumbbell className="w-16 h-16 text-gray-400" />
        <p className="text-3xl font-bold">{formData.trainingGoal} minutes</p>
        <p className="text-gray-600">per week</p>
        <Slider defaultValue={[60]} value={[formData.trainingGoal || 60]} max={300} step={15} onValueChange={([val]) => updateFormData('trainingGoal', val)} />
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
    // Optional Details
    <Step title="Any other details? (Optional)">
      <div className="space-y-4 w-full text-left">
          <div>
            <Label htmlFor="nickname">Nickname</Label>
            <Input id="nickname" value={formData.nickname} onChange={(e) => updateFormData('nickname', e.target.value)} placeholder="e.g., Bud" />
          </div>
          <div>
            <Label htmlFor="allergies">Allergies or health flags</Label>
            <Textarea id="allergies" value={formData.allergies} onChange={(e) => updateFormData('allergies', e.target.value)} placeholder="e.g., Pollen, sensitive stomach" />
          </div>
           <div>
            <Label htmlFor="favoriteFoods">Favorite foods (comma-separated)</Label>
            <Input id="favoriteFoods" value={tempFavFoods} onChange={(e) => setTempFavFoods(e.target.value)} placeholder="e.g., Chicken, Peanut Butter" />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch id="first-pet" checked={formData.isFirstPet} onCheckedChange={(val) => updateFormData('isFirstPet', val)} />
            <Label htmlFor="first-pet">Is this your first pet?</Label>
          </div>
      </div>
    </Step>,
    // Review
    <Step title="Does this look right?">
        <Card className="p-4 shadow-lg w-full">
            <CardHeader className="p-2">
              <CardTitle className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview || undefined} alt={formData.name} />
                    <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-xl">{formData.name} {formData.nickname && `(${formData.nickname})`}</h3>
                    <p className="text-gray-600 text-base">{formData.breed}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left text-sm space-y-2 pt-4">
                <div className="flex items-center gap-2"><Cake className="w-4 h-4 text-gray-500" /> {formData.age} years old</div>
                <div className="flex items-center gap-2"><Weight className="w-4 h-4 text-gray-500" /> {formData.weight} {formData.unitPreference === 'metric' ? 'kg' : 'lbs'}</div>
                <div className="flex items-center gap-2"><Bone className="w-4 h-4 text-gray-500" /> Activity: {formData.activityLevel}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" /> Eats at: {(formData.feedingSchedule || []).join(', ')}</div>
                <div className="flex items-center gap-2"><Dumbbell className="w-4 h-4 text-gray-500" /> Training goal: {formData.trainingGoal} mins/week</div>
                {formData.allergies && <div className="flex items-start gap-2"><Info className="w-4 h-4 text-red-500 mt-0.5" /> Allergies: {formData.allergies}</div>}
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
    <div className="flex flex-col items-center text-center gap-4 min-h-[420px]">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </div>
  );
}
