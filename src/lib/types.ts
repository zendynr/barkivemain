import type { Timestamp } from 'firebase/firestore';

export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Rabbit' | 'Bird' | 'Other';
  breed: string;
  age: number; // in years
  weight: number; // in kg
  activityLevel: 'Couch Potato' | 'Playful' | 'Hyperactive';
  avatarUrl: string;
}

export interface Memory {
  id: string;
  imageUrl: string;
  caption: string;
  timestamp: Date | Timestamp;
  aiHint?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: Date | Timestamp;
  type: 'walk' | 'play' | 'training';
  duration: number; // in minutes
  notes?: string;
}

export interface FeedingLog {
  id: string;
  timestamp: Date | Timestamp;
  foodType: 'Kibble' | 'Wet Food' | 'Treat' | 'Other';
  quantity: string; // e.g., "1 cup", "1 can", "2 treats"
  notes?: string;
  reaction?: 'happy' | 'neutral' | 'displeased';
}

export interface HealthLog {
  id: string;
  timestamp: Date | Timestamp;
  type: 'vet-visit' | 'vaccination' | 'grooming' | 'weight' | 'temperature' | 'medication';
  title: string;
  notes: string;
  value?: number | string;
}

export interface Reminder {
  id: string;
  type: 'vaccination' | 'appointment' | 'grooming' | 'medication';
  name: string;
  due: Date | Timestamp;
  notes?: string;
}
