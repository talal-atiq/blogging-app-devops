import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "fullstack-mern-blog.firebaseapp.com",
    projectId: "fullstack-mern-blog",
    storageBucket: "fullstack-mern-blog.appspot.com",
    messagingSenderId: "848208983089",
    appId: "1:848208983089:web:eba321f1798561add01110"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firebaseStorage = getStorage(app);