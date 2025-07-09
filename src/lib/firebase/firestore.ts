import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { FeedingLog, ActivityLog, Pet, Memory, HealthLog, Reminder } from '@/lib/types';

// Path helpers
const getPetsCollection = (userId: string) =>
    collection(db, 'users', userId, 'pets');

const getFeedingLogsCollection = (userId: string, petId: string) =>
  collection(db, 'users', userId, 'pets', petId, 'feedingLogs');

const getActivityLogsCollection = (userId: string, petId: string) =>
    collection(db, 'users', userId, 'pets', petId, 'activityLogs');

const getMemoriesCollection = (userId: string, petId: string) =>
  collection(db, 'users', userId, 'pets', petId, 'memories');

const getHealthLogsCollection = (userId: string, petId: string) =>
    collection(db, 'users', userId, 'pets', petId, 'healthLogs');

const getRemindersCollection = (userId: string, petId: string) =>
    collection(db, 'users', userId, 'pets', petId, 'reminders');


// --- Write Operations ---

export const addPetProfile = (
    userId: string,
    petData: Omit<Pet, 'id'>
) => {
    return addDoc(getPetsCollection(userId), petData);
}

export const addFeedingLog = (
  userId: string,
  petId: string,
  logData: Omit<FeedingLog, 'id' | 'timestamp'>
) => {
  const dataWithTimestamp = {
    ...logData,
    timestamp: serverTimestamp(),
  };
  return addDoc(getFeedingLogsCollection(userId, petId), dataWithTimestamp);
};

export const addActivityLog = (
    userId: string,
    petId: string,
    logData: Omit<ActivityLog, 'id' | 'timestamp'>
) => {
    const dataWithTimestamp = {
        ...logData,
        timestamp: serverTimestamp(),
    };
    return addDoc(getActivityLogsCollection(userId, petId), dataWithTimestamp);
};

export const addMemory = (
  userId: string,
  petId: string,
  memoryData: Omit<Memory, 'id' | 'timestamp'>
) => {
  const dataWithTimestamp = {
    ...memoryData,
    timestamp: serverTimestamp(),
  };
  return addDoc(getMemoriesCollection(userId, petId), dataWithTimestamp);
}

export const addHealthLog = (
    userId: string,
    petId: string,
    logData: Omit<HealthLog, 'id'>
) => {
    // Firestore handles JS Date object conversion to Timestamp automatically.
    return addDoc(getHealthLogsCollection(userId, petId), logData);
}

export const addReminder = (
    userId: string,
    petId: string,
    reminderData: Omit<Reminder, 'id'>
) => {
    return addDoc(getRemindersCollection(userId, petId), {
      ...reminderData,
    });
}

// --- Read Operations (onSnapshot for real-time updates) ---
// Note: Real-time listeners are implemented in the hooks for better component lifecycle management.
// You can add one-time fetch functions here if needed.
