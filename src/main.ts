import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'

import './assets/main.css'

console.log('Starting application initialization...')

const app = createApp(App)
console.log('Vue app created')

const pinia = createPinia()
console.log('Pinia store created')

app.use(pinia)
console.log('Pinia store mounted')

app.use(router)
console.log('Router mounted')

app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true
})

// Add error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.error('Error in component:', instance)
  console.error('Error info:', info)
}

console.log('Mounting app to #app element...')
app.mount('#app')
console.log('App mounted successfully') 