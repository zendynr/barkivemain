import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export const uploadPetAvatar = async (userId: string, file: File): Promise<string> => {
  const filePath = `users/${userId}/avatars/${file.name}_${new Date().getTime()}`;
  const storageRef = ref(storage, filePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading avatar: ", error);
    throw error;
  }
};

export const uploadMemoryImage = async (userId: string, petId: string, file: File): Promise<string> => {
  const filePath = `users/${userId}/pets/${petId}/memories/${file.name}_${new Date().getTime()}`;
  const storageRef = ref(storage, filePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading memory image: ", error);
    throw error;
  }
};
