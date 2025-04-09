<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminHeader from './components/AdminHeader.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import PageTransition from '@/components/PageTransition.vue'
import { db } from './firebase/config'

const adminStore = useAdminStore()
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // Test Firebase connection
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Firebase connection timeout'))
      }, 5000)

      // Try to connect to Firebase
      db.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val() === true) {
          clearTimeout(timeout)
          resolve(true)
        }
      })
    })

    // If we get here, Firebase is connected
    setTimeout(() => {
      isLoading.value = false
    }, 1000)
  } catch (err) {
    console.error('App initialization error:', err)
    error.value = 'Failed to connect to the server. Please try again later.'
    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="error" class="error-container">
    <h1>Error</h1>
    <p>{{ error }}</p>
    <button @click="window.location.reload()">Reload Page</button>
  </div>
  <LoadingScreen v-else-if="isLoading" message="Welcome to HUES By Horizon" />
  
  <PageTransition v-else name="scale">
    <div class="app-container">
      <AdminHeader />
      <main class="main-content">
        <RouterView v-slot="{ Component }">
          <PageTransition>
            <component :is="Component" />
          </PageTransition>
        </RouterView>
      </main>
    </div>
  </PageTransition>
</template>

<style>
/* Global styles */
:root {
  --primary-color: #002d65;
  --secondary-color: #3b82f6;
  --accent-color: #a3c2ff;
  --background-color: #f8f9fa;
  --text-color: #1f2937;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background: var(--background-color);
}

.app-container {
  min-height: 100vh;
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
}

/* Global animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Better focus styles */
:focus {
  outline: 2px solid var(--secondary-color);
  outline-offset: 2px;
}

/* Improved button styles */
button {
  cursor: pointer;
  font-family: inherit;
  border: none;
  background: none;
  padding: 0;
}

/* Improved link styles */
a {
  color: var(--secondary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--accent-color);
}

/* Improved scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background-color);
}

::-webkit-scrollbar-thumb {
  background: var(--secondary-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
}

/* Add smooth transitions for all interactive elements */
button,
a,
input,
select,
textarea {
  transition: all 0.2s ease;
}

/* Disable transitions when user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

body {
  background-color: #002d65;
  color: white;
  font-family: 'MontserratAlt', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.main-content {
  flex: 1;
  padding-top: 64px; /* Height of admin header */
  overflow-y: auto;
  position: relative;
}

/* Custom scrollbar styles */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 2rem;
}

.error-container h1 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.error-container button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-container button:hover {
  background-color: var(--secondary-color);
}
</style> 