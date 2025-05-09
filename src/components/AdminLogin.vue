<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useRouter } from 'vue-router'

const adminStore = useAdminStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const isSubmitting = ref(false)

const handleLogin = async () => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    await adminStore.login(username.value, password.value)
    router.push('/admin')
  } catch (error) {
    // Error is already handled by the store
    console.error('Login error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Admin Login</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            id="username"
            v-model="username"
            type="text"
            required
            placeholder="Enter username"
            :disabled="adminStore.isLoading || isSubmitting"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter password"
            :disabled="adminStore.isLoading || isSubmitting"
            autocomplete="current-password"
          />
        </div>
        <div v-if="adminStore.error" class="error" role="alert">
          {{ adminStore.error }}
        </div>
        <button 
          type="submit"
          :disabled="adminStore.isLoading || isSubmitting || !username || !password"
          class="login-button"
        >
          <span v-if="adminStore.isLoading || isSubmitting">
            Logging in...
          </span>
          <span v-else>
            Login
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.login-box {
  background: rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 12px;
  text-align: center;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #4169E1;
  box-shadow: 0 0 0 2px rgba(65, 105, 225, 0.2);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-group input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

h2 {
  margin-bottom: 2rem;
  color: white;
  font-size: 1.8rem;
}

.error {
  color: #ff6b6b;
  margin: 1rem 0;
  padding: 0.8rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 6px;
  text-align: center;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.form-group input.error {
  border-color: #ff6b6b;
}

.form-group input.error:focus {
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
}

.login-button {
  background: #4169E1;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-button:hover:not(:disabled) {
  background: #3158d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(65, 105, 225, 0.3);
}
</style> 