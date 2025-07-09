import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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
