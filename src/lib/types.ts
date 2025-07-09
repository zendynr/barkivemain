export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number; // in years
  weight: number; // in kg
  avatarUrl: string;
}

export interface Memory {
  id: string;
  imageUrl: string;
  caption: string;
  timestamp: Date;
  aiHint?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  type: 'walk' | 'play' | 'training';
  duration: number; // in minutes
  notes?: string;
}

export interface FeedingLog {
  id: string;
  timestamp: Date;
  foodType: 'Kibble' | 'Wet Food' | 'Treat' | 'Other';
  quantity: string; // e.g., "1 cup", "1 can", "2 treats"
  notes?: string;
}
