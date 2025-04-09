<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import { useBannedUsersStore } from '@/stores/bannedUsers'
import type { Event } from '@/stores/events'

const route = useRoute()
const router = useRouter()
const eventStore = useEventsStore()
const bannedUsersStore = useBannedUsersStore()

const event = ref<Event | null>(null)
const loading = ref(true)
const error = ref('')

const formData = ref({
  firstName: '',
  lastName: '',
  vatsimCID: '',
  email: '',
  aircraftType: '',
  route: '',
  notes: '',
  agreementSignature: ''
})

const errors = ref<Record<string, string>>({})

const validateForm = () => {
  const newErrors: Record<string, string> = {}
  
  if (!formData.value.firstName) newErrors.firstName = 'First name is required'
  if (!formData.value.lastName) newErrors.lastName = 'Last name is required'
  if (!formData.value.vatsimCID) {
    newErrors.vatsimCID = 'VATSIM CID is required'
  } else if (bannedUsersStore.isUserBanned(formData.value.vatsimCID)) {
    newErrors.vatsimCID = 'This VATSIM CID is currently banned from participating in events'
  }
  if (!formData.value.email) {
    newErrors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    newErrors.email = 'Please enter a valid email address'
  }
  if (!formData.value.aircraftType) newErrors.aircraftType = 'Aircraft type is required'
  if (!formData.value.route) newErrors.route = 'Route is required'
  if (!formData.value.agreementSignature) {
    newErrors.agreementSignature = 'Electronic signature is required'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    // Submit booking logic here
    router.push('/dashboard')
  } catch (err) {
    error.value = 'Failed to submit booking. Please try again.'
  }
}

onMounted(async () => {
  try {
    const eventId = route.params.id as string
    
    if (eventStore.events.length === 0) {
      await eventStore.fetchEvents()
    }
    
    const foundEvent = eventStore.events.find(e => e.id === eventId)
    if (!foundEvent) {
      throw new Error('Flight not found')
    }
    
    event.value = foundEvent
    loading.value = false
  } catch (err) {
    error.value = 'Failed to load flight details. Please try again.'
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#0a192f] text-white">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="bg-red-500/10 text-red-400 px-6 py-4 rounded-lg border border-red-500/20">{{ error }}</div>
    </div>

    <div v-else-if="event" class="container mx-auto px-4 py-12 max-w-5xl">
      <!-- Header Card -->
      <div class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl p-8 mb-12 border border-blue-500/20 backdrop-blur-sm">
        <h1 class="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Book Your Flight
        </h1>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div>
              <h2 class="text-lg font-medium text-blue-400 mb-2">Flight Information</h2>
              <div class="space-y-3 text-gray-300">
                <p class="text-xl font-semibold text-white">{{ event.title }}</p>
                <p class="flex items-center gap-2">
                  <span class="text-blue-400">✈</span>
                  {{ event.fromICAO }} → {{ event.toICAO }}
                </p>
                <p class="flex items-center gap-2">
                  <span class="text-blue-400">🕒</span>
                  Selected Time: 06:00Z
                </p>
                <p class="flex items-center gap-2">
                  <span class="text-blue-400">⏱</span>
                  Duration: 2h 5m
                </p>
              </div>
            </div>
          </div>
          
          <div class="space-y-6">
            <div>
              <h2 class="text-lg font-medium text-blue-400 mb-2">Aircraft Details</h2>
              <div class="space-y-3 text-gray-300">
                <p class="flex items-center gap-2">
                  <span class="text-blue-400">🛩</span>
                  Aircraft: A320/A321/A319
                </p>
                <p class="flex items-center gap-2">
                  <span class="text-blue-400">📊</span>
                  Flight Level: PILOT DISCRETION
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Form -->
      <div class="space-y-12">
        <!-- Personal Information -->
        <section class="bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
          <h2 class="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span class="text-blue-400">👤</span>
            Personal Information
          </h2>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="form-group">
              <label>First Name</label>
              <input
                v-model="formData.firstName"
                type="text"
                :class="{ 'error': errors.firstName }"
              >
              <div v-if="errors.firstName" class="error-message">{{ errors.firstName }}</div>
            </div>

            <div class="form-group">
              <label>Last Name</label>
              <input
                v-model="formData.lastName"
                type="text"
                :class="{ 'error': errors.lastName }"
              >
              <div v-if="errors.lastName" class="error-message">{{ errors.lastName }}</div>
            </div>

            <div class="form-group">
              <label>VATSIM CID</label>
              <input
                v-model="formData.vatsimCID"
                type="text"
                :class="{ 'error': errors.vatsimCID }"
              >
              <div v-if="errors.vatsimCID" class="error-message">{{ errors.vatsimCID }}</div>
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input
                v-model="formData.email"
                type="email"
                :class="{ 'error': errors.email }"
              >
              <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
            </div>
          </div>
        </section>

        <!-- Flight Details -->
        <section class="bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
          <h2 class="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span class="text-blue-400">✈</span>
            Flight Details
          </h2>
          
          <div class="space-y-6">
            <div class="form-group">
              <label>Aircraft Type</label>
              <input
                v-model="formData.aircraftType"
                type="text"
                :class="{ 'error': errors.aircraftType }"
              >
              <div v-if="errors.aircraftType" class="error-message">{{ errors.aircraftType }}</div>
            </div>

            <div class="form-group">
              <label>Route</label>
              <input
                v-model="formData.route"
                type="text"
                :class="{ 'error': errors.route }"
              >
              <div v-if="errors.route" class="error-message">{{ errors.route }}</div>
            </div>

            <div class="form-group">
              <label>Additional Notes</label>
              <textarea
                v-model="formData.notes"
                rows="3"
                class="resize-none"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- Terms and Conditions -->
        <section class="bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
          <h2 class="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span class="text-blue-400">📋</span>
            Terms and Conditions
          </h2>

          <div class="bg-black/20 rounded-xl p-6 mb-8">
            <div class="space-y-4">
              <div class="term-item">
                <span class="term-icon">✈️</span>
                <p>I must push back at my assigned slot time.</p>
              </div>
              <div class="term-item">
                <span class="term-icon">⚠️</span>
                <p>Failure to push back at the assigned slot time may result in removal from this event and/or exclusion from future events.</p>
              </div>
              <div class="term-item">
                <span class="term-icon">👤</span>
                <p>I must actually show up for my assigned slot.</p>
              </div>
              <div class="term-item">
                <span class="term-icon">🚫</span>
                <p>No-shows may be banned from future events.</p>
              </div>
              <div class="term-item">
                <span class="term-icon">🔒</span>
                <p>Slots are non-transferable without prior approval.</p>
              </div>
              <div class="term-item">
                <span class="term-icon">📋</span>
                <p>I must be ready to fly at my assigned time with my flight plan filed.</p>
              </div>
              <div class="term-item">
                <span class="term-icon">⚡</span>
                <p>I understand that failure to comply with these terms may result in immediate removal from the event and potential exclusion from future events.</p>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Electronic Signature</label>
            <input
              v-model="formData.agreementSignature"
              type="text"
              placeholder="Type your full name to agree to the terms"
              :class="{ 'error': errors.agreementSignature }"
            >
            <div v-if="errors.agreementSignature" class="error-message">{{ errors.agreementSignature }}</div>
          </div>
        </section>

        <!-- Submit Button -->
        <button
          @click="handleSubmit"
          class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a192f] shadow-lg shadow-blue-500/20"
        >
          Submit Booking
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-group {
  @apply space-y-2;
}

.form-group label {
  @apply block text-sm font-medium text-gray-300;
}

.form-group input,
.form-group textarea {
  @apply w-full bg-black/20 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 transition-all duration-200;
  @apply hover:border-blue-500/40;
  @apply focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
}

.form-group input.error,
.form-group textarea.error {
  @apply border-red-500;
}

.error-message {
  @apply text-sm text-red-400 mt-1;
}

.term-item {
  @apply flex items-start gap-3 text-gray-300;
}

.term-icon {
  @apply flex-shrink-0 mt-1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    @apply px-4;
  }
  
  section {
    @apply p-6;
  }
  
  h1 {
    @apply text-3xl;
  }
  
  h2 {
    @apply text-xl;
  }
}
</style> 