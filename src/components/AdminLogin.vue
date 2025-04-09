<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useRouter } from 'vue-router'
import { watch } from 'vue'

const adminStore = useAdminStore()
const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
  await adminStore.login(username.value, password.value)
}

// Watch for authentication state changes
watch(() => adminStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    router.push('/admin')
  }
})
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
          />
        </div>
        <div v-if="adminStore.error" class="error">
          {{ adminStore.error }}
        </div>
        <button 
          type="submit"
          :disabled="adminStore.isLoading"
          class="login-button"
        >
          {{ adminStore.isLoading ? 'Logging in...' : 'Login' }}
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
}

.login-box {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  width: 100%;
  max-width: 400px;
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
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

h2 {
  margin-bottom: 2rem;
  color: white;
}

.error {
  color: #dc3545;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
  text-align: center;
}

.login-button {
  background: #4169E1;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 4px;
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
}
</style> 