import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'

export const useAdminStore = defineStore('admin', () => {
  const isAuthenticated = ref(false)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const user = ref<User | null>(null)

  // Initialize auth state listener
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    isAuthenticated.value = !!currentUser
  })

  const login = async (username: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null
      // Convert username to email format for Firebase
      const email = `${username}@hues.admin`
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      isAuthenticated.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to login'
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
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to logout'
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