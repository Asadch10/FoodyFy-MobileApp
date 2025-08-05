import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBMW2qNDF11gIPbKuuTHQ0s5WTNROXWsiw",
  authDomain: "foodyfy-3850c.firebaseapp.com",
  projectId: "foodyfy-3850c",
  storageBucket: "foodyfy-3850c.firebasestorage.app",
  messagingSenderId: "222939430543",
  appId: "1:222939430543:web:5354c8a4559ab8af6dbafa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Test Firebase connection
console.log('Firebase initialized with project:', firebaseConfig.projectId);

export default app;