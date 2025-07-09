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
}

export interface FeedingLog {
  id: string;
  timestamp: Date;
}
