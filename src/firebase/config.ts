import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyBpRkyl6HoR1TQV7HuzBWkkLFKf8hYVXdk",
  authDomain: "hueseventsdb.firebaseapp.com",
  databaseURL: "https://hueseventsdb-default-rtdb.firebaseio.com",
  projectId: "hueseventsdb",
  storageBucket: "hueseventsdb.firebasestorage.app",
  messagingSenderId: "285098880882",
  appId: "1:285098880882:web:e81b7bcf22a67aeeee37eb",
  measurementId: "G-GJ5XR7CNQY"
}

console.log('Initializing Firebase with config:', firebaseConfig)
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
console.log('Database initialized:', db)

const auth = getAuth(app)
const analytics = getAnalytics(app)

export { app, db, auth, analytics } 