import { defineStore } from 'pinia'
import { ref } from 'vue'

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'HUESAdmin',
  password: 'HUESAdmin123!'
}

export const useAdminStore = defineStore('admin', () => {
  const isAuthenticated = ref(false)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const user = ref<{ username: string } | null>(null)

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login with username:', username)
      isLoading.value = true
      error.value = null
      
      // Validate input
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      // Check against hardcoded credentials
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        user.value = { username }
        isAuthenticated.value = true
        console.log('Login successful')
      } else {
        error.value = 'Invalid username or password'
        throw new Error('Invalid credentials')
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

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    console.log('Logout successful')
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