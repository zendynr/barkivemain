import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
} from 'firebase/auth';
import { auth } from './config';

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = (email: string, password:string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
  return signOut(auth);
};

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const deleteCurrentUser = () => {
  if (auth.currentUser) {
    return deleteUser(auth.currentUser);
  }
  return Promise.reject(new Error("No user is currently signed in."));
};
