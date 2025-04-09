import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBpRkyl6HoR1TQV7HuzBWkkLFKf8hYVXdk",
  authDomain: "hueseventsdb.firebaseapp.com",
  databaseURL: "https://hueseventsdb-default-rtdb.firebaseio.com",
  projectId: "hueseventsdb",
  storageBucket: "hueseventsdb.firebasestorage.app",
  messagingSenderId: "285098880882",
  appId: "1:285098880882:web:e81b7bcf22a67aeeee37eb",
  measurementId: "G-GJ5XR7CNQY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Create admin user
const createAdmin = async () => {
  try {
    await set(ref(db, 'admins/HUESAdmin'), {
      username: 'HUESAdmin',
      password: 'ev3nt$201H', // In a real app, this should be hashed
      role: 'admin'
    });
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
  process.exit();
};

createAdmin(); 