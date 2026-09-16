import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDDoH77_DlTigPeSQdr4iIBC21_Anf182A',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'acuarela-restaurant.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'acuarela-restaurant',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'acuarela-restaurant.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '359039382431',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:359039382431:web:b9920ef854c5aa31a783aa',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
