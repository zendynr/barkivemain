import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { FeedingLog, ActivityLog, Pet } from '@/lib/types';

// Path helpers
const getPetsCollection = (userId: string) =>
    collection(db, 'users', userId, 'pets');

const getFeedingLogsCollection = (userId: string, petId: string) =>
  collection(db, 'users', userId, 'pets', petId, 'feedingLogs');

const getActivityLogsCollection = (userId: string, petId: string) =>
    collection(db, 'users', userId, 'pets', petId, 'activityLogs');


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

// --- Read Operations (onSnapshot for real-time updates) ---
// Note: Real-time listeners are implemented in the hooks for better component lifecycle management.
// You can add one-time fetch functions here if needed.
