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
const selectedTime = ref(route.query.selectedTime as string || '')

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  vatsimCID: '',
  aircraftType: '',
  notes: '',
  email: '',
  route: '',
  agreementSignature: '',
  agreementTimestamp: ''
})

// Form validation
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
  if (!formData.value.aircraftType) newErrors.aircraftType = 'Aircraft type is required'
  if (!formData.value.route) newErrors.route = 'Route is required'
  if (!formData.value.email) {
    newErrors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    newErrors.email = 'Please enter a valid email address'
  }
  if (!formData.value.agreementSignature) {
    newErrors.agreementSignature = 'Electronic signature is required to accept the terms'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    // TODO: Implement booking submission
    console.log('Booking submitted:', {
      eventId: event.value?.id,
      time: selectedTime.value,
      ...formData.value
    })
    
    // Navigate to confirmation or success page
    router.push({
      name: 'event-details',
      params: { id: route.params.id },
      query: { booked: 'true' }
    })
  } catch (err) {
    error.value = 'Failed to submit booking. Please try again.'
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const eventId = route.params.id as string
    console.log('BookEventView: Mounting with event ID:', eventId)
    console.log('BookEventView: Selected time:', selectedTime.value)
    
    if (eventStore.events.length === 0) {
      console.log('BookEventView: Fetching events...')
      await eventStore.fetchEvents()
    }
    
    const foundEvent = eventStore.events.find(e => e.id === eventId)
    if (!foundEvent) {
      throw new Error('Flight not found')
    }
    
    console.log('BookEventView: Event found:', {
      title: foundEvent.title,
      date: foundEvent.date,
      time: foundEvent.time
    })
    
    event.value = foundEvent
    loading.value = false
  } catch (err) {
    error.value = 'Failed to load flight details. Please try again.'
    console.error('Error loading flight:', err)
    loading.value = false
  }
})
</script>

<template>
  <div class="booking-page min-h-screen bg-[#0a192f] text-white py-8">
    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 text-center">
      <div class="loading-spinner mx-auto mb-4"></div>
      <p class="text-lg">Loading booking details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 text-center">
      <div class="bg-red-500/20 rounded-lg p-6 max-w-md mx-auto">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-lg text-red-300">{{ error }}</p>
      </div>
    </div>

    <!-- Booking Form -->
    <div v-else-if="event" class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto">
        <!-- Flight Summary -->
        <div class="bg-white/5 rounded-lg p-6 mb-8">
          <h1 class="text-3xl font-bold mb-6">Book Your Flight</h1>
          <div class="flight-summary grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 class="text-xl font-semibold mb-4">{{ event.title }}</h2>
              <div class="space-y-2">
                <p class="text-blue-300">
                  <span class="font-mono">{{ event.fromICAO }}</span>
                  <span class="mx-2">→</span>
                  <span class="font-mono">{{ event.toICAO }}</span>
                </p>
                <p class="text-gray-400">Selected Time: {{ selectedTime }}</p>
              </div>
            </div>
            <div class="space-y-2">
              <p><span class="text-gray-400">Aircraft:</span> {{ event.aircraft }}</p>
              <p><span class="text-gray-400">Flight Level:</span> FL{{ event.flightLevel }}</p>
              <p><span class="text-gray-400">Duration:</span> {{ event.estimatedDuration }}</p>
            </div>
          </div>
        </div>

        <!-- Registration Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Personal Information -->
          <div class="bg-white/5 rounded-lg p-6">
            <h3 class="text-xl font-semibold mb-4">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input
                  v-model="formData.firstName"
                  type="text"
                  class="w-full bg-white/10 border border-gray-600 rounded-md px-4 py-2 text-white"
                  :class="{ 'border-red-500': errors.firstName }"
                >
                <p v-if="errors.firstName" class="mt-1 text-sm text-red-400">{{ errors.firstName }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input
                  v-model="formData.lastName"
                  type="text"
                  class="w-full bg-white/10 border border-gray-600 rounded-md px-4 py-2 text-white"
                  :class="{ 'border-red-500': errors.lastName }"
                >
                <p v-if="errors.lastName" class="mt-1 text-sm text-red-400">{{ errors.lastName }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">VATSIM CID</label>
                <input
                  v-model="formData.vatsimCID"
                  type="text"
                  class="w-full bg-white/10 border border-gray-600 rounded-md px-4 py-2 text-white"
                  :class="{ 'border-red-500': errors.vatsimCID }"
                >
                <p v-if="errors.vatsimCID" class="mt-1 text-sm text-red-400">{{ errors.vatsimCID }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="w-full bg-white/10 border border-gray-600 rounded-md px-4 py-2 text-white"
                  :class="{ 'border-red-500': errors.email }"
                >
                <p v-if="errors.email" class="mt-1 text-sm text-red-400">{{ errors.email }}</p>
              </div>
            </div>
          </div>

          <!-- Flight Details -->
          <div class="bg-white/5 rounded-lg p-6">
            <h3 class="text-xl font-semibold mb-4">Flight Details</h3>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Aircraft Type</label>
                <input
                  v-model="formData.aircraftType"
                  type="text"
                  class="w-full bg-white/10 border border-gray-600 rounded-md px-4 py-2 text-white"
                  :class="{ 'border-red-500': errors.aircraftType }"
                >
                <p v-if="errors.aircraftType" class="mt-1 text-sm text-red-400">{{ errors.aircraftType }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Route</label>
                <input
                  v-model="formData.route"
                  type="text"
                  class="w-full bg-white/10 border border-gray-600 rounded-md px-4 py-2 text-white"
                  :class="{ 'border-red-500': errors.route }"
                >
                <p v-if="errors.route" class="mt-1 text-sm text-red-400">{{ errors.route }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Additional Notes</label>
                <textarea
                  v-model="formData.notes"
                  rows="3"
                  class="w-full bg-white/10 border border-gray-600 rounded-md px-4 py-2 text-white"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Agreement -->
          <div class="bg-white rounded-lg p-8 shadow-lg">
            <h3 class="text-2xl font-bold text-center text-[#002d65] mb-6">TERMS AND CONDITIONS</h3>
            <p class="text-[#002d65] text-lg mb-6 text-center">By signing below, I understand and agree to the following terms:</p>
            
            <div class="space-y-4">
              <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <span class="text-xl">✈️</span>
                <p class="text-gray-700">I must push back at my assigned slot time.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <span class="text-xl">⚠️</span>
                <p class="text-gray-700">Failure to push back at the assigned slot time may result in removal from this event and/or exclusion from future events.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <span class="text-xl">👤</span>
                <p class="text-gray-700">I must actually show up for my assigned slot.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <span class="text-xl">🚫</span>
                <p class="text-gray-700">No-shows may be banned from future events.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <span class="text-xl">🔒</span>
                <p class="text-gray-700">Slots are non-transferable without prior approval.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <span class="text-xl">📋</span>
                <p class="text-gray-700">I must be ready to fly at my assigned time with my flight plan filed.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <span class="text-xl">⚡</span>
                <p class="text-gray-700">I understand that failure to comply with these terms may result in immediate removal from the event and potential exclusion from future events.</p>
              </div>
            </div>

            <div class="mt-8">
              <label class="block text-lg font-semibold text-[#002d65] mb-2">Electronic Signature</label>
              <input
                v-model="formData.agreementSignature"
                type="text"
                placeholder="Type your full name as signature"
                class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                :class="{ 'border-red-500': errors.agreementSignature }"
              >
              <p v-if="errors.agreementSignature" class="mt-1 text-sm text-red-500">{{ errors.agreementSignature }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end mt-6">
            <button
              type="submit"
              class="bg-[#002d65] hover:bg-[#001f4b] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Submit Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 