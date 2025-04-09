import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebase/config'
import { ref as dbRef, get } from 'firebase/database'

export const useAdminStore = defineStore('admin', () => {
  const isAuthenticated = ref(false)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const email = ref<string>('')

  const login = async (username: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const adminRef = dbRef(db, `admins/${username}`)
      const snapshot = await get(adminRef)
      
      if (snapshot.exists()) {
        const adminData = snapshot.val()
        
        if (adminData.password === password && adminData.role === 'admin') {
          isAuthenticated.value = true
          email.value = username
        } else {
          throw new Error('Invalid credentials')
        }
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (e: any) {
      error.value = 'Invalid credentials. Please try again.'
      isAuthenticated.value = false
      email.value = ''
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    isAuthenticated.value = false
    email.value = ''
  }

  return {
    isAuthenticated,
    error,
    isLoading,
    email,
    login,
    logout
  }
}) 