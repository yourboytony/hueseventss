import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

export const useAdminStore = defineStore('admin', () => {
  const isAuthenticated = ref(false)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const email = ref('')

  const isLoggedIn = computed(() => isAuthenticated.value)

  const login = async (username: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null
      const userCredential = await signInWithEmailAndPassword(auth, username, password)
      isAuthenticated.value = true
      email.value = userCredential.user.email || ''
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to login'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    signOut(auth)
    isAuthenticated.value = false
    email.value = ''
  }

  return {
    isAuthenticated,
    isLoggedIn,
    error,
    isLoading,
    email,
    login,
    logout
  }
}) 