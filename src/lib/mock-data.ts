import type { Pet, Memory, ActivityLog, FeedingLog } from './types';

export const pet: Pet = {
  id: 'pet1',
  name: 'Buddy',
  breed: 'Golden Retriever',
  age: 5,
  weight: 30, // kg
  avatarUrl: 'https://placehold.co/128x128.png',
};

// Generate mock date for today
const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date();
twoDaysAgo.setDate(today.getDate() - 2);
const threeDaysAgo = new Date();
threeDaysAgo.setDate(today.getDate() - 3);
const fourDaysAgo = new Date();
fourDaysAgo.setDate(today.getDate() - 4);
const fiveDaysAgo = new Date();
fiveDaysAgo.setDate(today.getDate() - 5);


export const memories: Memory[] = [
  {
    id: 'mem1',
    imageUrl: 'https://placehold.co/600x400.png',
    caption: 'Fun times at the beach!',
    timestamp: new Date(),
    aiHint: 'dog beach',
  },
  {
    id: 'mem2',
    imageUrl: 'https://placehold.co/600x400.png',
    caption: 'First time seeing snow!',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    aiHint: 'dog snow',
  },
  {
    id: 'mem3',
    imageUrl: 'https://placehold.co/600x400.png',
    caption: 'Napping in the sunbeam.',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)),
    aiHint: 'dog sleeping',
  },
  {
    id: 'mem4',
    imageUrl: 'https://placehold.co/600x400.png',
    caption: 'Playing fetch in the park.',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 5)),
    aiHint: 'dog park',
  },
  {
    id: 'mem5',
    imageUrl: 'https://placehold.co/600x400.png',
    caption: 'Birthday party with all the friends!',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 10)),
    aiHint: 'dog party',
  },
    {
    id: 'mem6',
    imageUrl: 'https://placehold.co/600x400.png',
    caption: 'My favorite toy!',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 12)),
    aiHint: 'dog toy',
  },
];

export const activityLogs: ActivityLog[] = [
  { id: 'act1', timestamp: new Date(new Date().setHours(8, 0, 0, 0)), type: 'walk', duration: 30, notes: 'A lovely morning walk.' },
  { id: 'act2', timestamp: new Date(new Date(yesterday).setHours(17, 0, 0, 0)), type: 'play', duration: 45, notes: 'Played fetch with the new ball.' },
  { id: 'act3', timestamp: new Date(new Date(twoDaysAgo).setHours(8, 0, 0, 0)), type: 'walk', duration: 30 },
  { id: 'act4', timestamp: new Date(new Date(threeDaysAgo).setHours(18, 0, 0, 0)), type: 'training', duration: 15, notes: "Practiced 'sit' and 'stay'." },
  { id: 'act5', timestamp: new Date(new Date(fourDaysAgo).setHours(9, 0, 0, 0)), type: 'walk', duration: 60 },
  { id: 'act6', timestamp: new Date(new Date(fiveDaysAgo).setHours(15, 0, 0, 0)), type: 'play', duration: 30 },
];

export const feedingLogs: FeedingLog[] = [
  // Today's meals
  {
    id: 'feed1',
    timestamp: new Date(new Date().setHours(8, 30, 0, 0)),
    foodType: 'Kibble',
    quantity: '1 cup',
  },
    {
    id: 'feed2',
    timestamp: new Date(new Date().setHours(18, 0, 0, 0)),
    foodType: 'Wet Food',
    quantity: '1 can',
  },
  // Yesterday's meals
  {
    id: 'feed3',
    timestamp: new Date(new Date(yesterday).setHours(8, 35, 0, 0)),
    foodType: 'Kibble',
    quantity: '1 cup',
    notes: 'Ate it all up quickly!',
  },
  {
    id: 'feed4',
    timestamp: new Date(new Date(yesterday).setHours(18, 10, 0, 0)),
    foodType: 'Wet Food',
    quantity: '1 can',
  },
];
