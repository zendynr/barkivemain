import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  doc,
  deleteDoc,
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

export const updateActivityLog = (
    userId: string,
    petId: string,
    logId: string,
    logData: Partial<Omit<ActivityLog, 'id' | 'timestamp'>>
) => {
    const logDocRef = doc(db, 'users', userId, 'pets', petId, 'activityLogs', logId);
    return updateDoc(logDocRef, logData);
};

export const deleteActivityLog = (
    userId: string,
    petId: string,
    logId: string
) => {
    const logDocRef = doc(db, 'users', userId, 'pets', petId, 'activityLogs', logId);
    return deleteDoc(logDocRef);
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

export const updateHealthLog = (
    userId: string,
    petId: string,
    logId: string,
    logData: Partial<Omit<HealthLog, 'id'>>
) => {
    const logDocRef = doc(db, 'users', userId, 'pets', petId, 'healthLogs', logId);
    return updateDoc(logDocRef, logData);
}

export const deleteHealthLog = (
    userId: string,
    petId: string,
    logId: string
) => {
    const logDocRef = doc(db, 'users', userId, 'pets', petId, 'healthLogs', logId);
    return deleteDoc(logDocRef);
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

export const updateReminder = (
    userId: string,
    petId: string,
    reminderId: string,
    reminderData: Partial<Omit<Reminder, 'id'>>
) => {
    const reminderDocRef = doc(db, 'users', userId, 'pets', petId, 'reminders', reminderId);
    return updateDoc(reminderDocRef, reminderData);
}

export const deleteReminder = (
    userId: string,
    petId: string,
    reminderId: string,
) => {
    const reminderDocRef = doc(db, 'users', userId, 'pets', petId, 'reminders', reminderId);
    return deleteDoc(reminderDocRef);
}


// --- Read Operations (onSnapshot for real-time updates) ---
// Note: Real-time listeners are implemented in the hooks for better component lifecycle management.
// You can add one-time fetch functions here if needed.
