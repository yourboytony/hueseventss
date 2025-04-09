import { initializeApp, FirebaseApp } from 'firebase/app'
import { getDatabase, Database } from 'firebase/database'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'
import { getAnalytics, Analytics } from 'firebase/analytics'

// Log all environment variables (except sensitive ones)
console.log('Environment variables:', {
  ...Object.fromEntries(
    Object.entries(import.meta.env)
      .filter(([key]) => !key.includes('API_KEY'))
      .map(([key, value]) => [key, value])
  )
})

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
]

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName])

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars)
  console.error('Current environment:', import.meta.env)
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

console.log('Firebase config:', {
  ...firebaseConfig,
  apiKey: '[REDACTED]'
})

let app: FirebaseApp
let db: Database
let auth: Auth
let analytics: Analytics

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig)
  console.log('Firebase app initialized')

  // Initialize Auth
  auth = getAuth(app)
  console.log('Firebase auth initialized')

  // Initialize Database
  db = getDatabase(app)
  console.log('Firebase database initialized')

  // Initialize Analytics
  analytics = getAnalytics(app)
  console.log('Firebase analytics initialized')

  // Add auth state change listener for debugging
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User is signed in:', user.uid)
    } else {
      console.log('User is signed out')
    }
  })

} catch (error) {
  console.error('Error initializing Firebase:', error)
  if (error instanceof Error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
  }
  throw error
}

export { app, db, auth, analytics } 