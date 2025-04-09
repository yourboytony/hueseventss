import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User, AuthError } from 'firebase/auth'

export const useAdminStore = defineStore('admin', () => {
  const isAuthenticated = ref(false)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const user = ref<User | null>(null)

  // Initialize auth state listener
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    isAuthenticated.value = !!currentUser
    console.log('Auth state changed:', { 
      isAuthenticated: isAuthenticated.value,
      userId: currentUser?.uid
    })
  })

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login with username:', username)
      isLoading.value = true
      error.value = null
      
      // Validate input
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      // Convert username to email format for Firebase
      const email = username.includes('@') ? username : `${username}@hues.admin`
      console.log('Using email format:', email)
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        user.value = userCredential.user
        isAuthenticated.value = true
        console.log('Login successful:', userCredential.user.uid)
      } catch (authError) {
        console.error('Auth error details:', authError)
        // Handle specific Firebase auth errors
        const err = authError as AuthError
        switch (err.code) {
          case 'auth/configuration-not-found':
            error.value = 'Authentication is not properly configured. Please contact support.'
            console.error('Firebase configuration error. Please check Firebase Console settings.')
            break
          case 'auth/user-not-found':
            error.value = 'Invalid username or password'
            break
          case 'auth/wrong-password':
            error.value = 'Invalid username or password'
            break
          case 'auth/invalid-email':
            error.value = 'Invalid username format'
            break
          case 'auth/user-disabled':
            error.value = 'This account has been disabled'
            break
          case 'auth/too-many-requests':
            error.value = 'Too many failed attempts. Please try again later'
            break
          default:
            error.value = 'Failed to login. Please try again'
            console.error('Unhandled auth error:', err)
        }
        throw err
      }
    } catch (err) {
      if (!error.value) {
        error.value = err instanceof Error ? err.message : 'Failed to login'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      isAuthenticated.value = false
      console.log('Logout successful')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to logout'
      console.error('Logout error:', err)
      throw err
    }
  }

  return {
    isAuthenticated,
    error,
    isLoading,
    user,
    login,
    logout
  }
}) 