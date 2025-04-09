import { initializeApp, FirebaseApp } from 'firebase/app'
import { getDatabase, Database } from 'firebase/database'
import { getAuth, Auth } from 'firebase/auth'
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

console.log('Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: '[REDACTED]' // Don't log the actual API key
})

let app: FirebaseApp
let db: Database
let auth: Auth
let analytics: Analytics

try {
  app = initializeApp(firebaseConfig)
  db = getDatabase(app)
  auth = getAuth(app)
  analytics = getAnalytics(app)
  console.log('Firebase initialized successfully')
} catch (error) {
  console.error('Error initializing Firebase:', error)
  throw error
}

export { app, db, auth, analytics } 