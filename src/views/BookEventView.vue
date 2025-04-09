<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import { useBannedUsersStore } from '@/stores/bannedUsers'
import type { Event } from '@/stores/events'
import { getEventById } from '@/services/events'
import { createBooking } from '@/services/bookings'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const eventStore = useEventsStore()
const bannedUsersStore = useBannedUsersStore()
const toast = useToast()

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
  if (!validateForm()) {
    toast.error('Please fill in all required fields correctly')
    return
  }
  
  try {
    await createBooking({
      eventId: event.value?.id,
      timeSlot: selectedTime.value,
      ...formData.value
    })
    
    toast.success('Booking submitted successfully!')
    router.push('/dashboard')
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
  <div class="min-h-screen bg-[#0a192f] text-white py-12">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto bg-red-500/10 rounded-lg p-6 border border-red-500/20">
        <p class="text-red-400 text-center">{{ error }}</p>
      </div>
    </div>

    <!-- Booking Form -->
    <div v-else-if="event" class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Title Section -->
        <div class="text-4xl font-bold text-white mb-2">Book Your Flight</div>
        <div class="text-xl text-blue-400 mb-8">{{ event.title }}</div>

        <!-- Flight Info Card -->
        <div class="bg-[#001529] rounded-lg p-6 border border-blue-500/20 mb-8">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <div class="text-gray-400 mb-1">EDDF → LEPA</div>
              <div class="text-blue-400">Selected Time: {{ selectedTime }}</div>
              <div class="text-gray-400 mt-2">Duration: {{ event.estimatedDuration }}</div>
            </div>
            <div>
              <div class="text-gray-400">Aircraft: <span class="text-blue-400">{{ event.aircraft }}</span></div>
              <div class="text-gray-400">Flight Level: <span class="text-blue-400">FL{{ event.flightLevel }}</span></div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Personal Information -->
          <div class="bg-[#001529] rounded-lg p-6 border border-blue-500/20">
            <div class="text-xl text-blue-400 mb-6">Personal Information</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="text-gray-400 block mb-2">First Name</label>
                <input
                  v-model="formData.firstName"
                  type="text"
                  class="w-full bg-[#0a192f] border border-blue-500/30 rounded px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.firstName }"
                >
                <p v-if="errors.firstName" class="mt-1 text-sm text-red-400">{{ errors.firstName }}</p>
              </div>

              <div>
                <label class="text-gray-400 block mb-2">Last Name</label>
                <input
                  v-model="formData.lastName"
                  type="text"
                  class="w-full bg-[#0a192f] border border-blue-500/30 rounded px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.lastName }"
                >
                <p v-if="errors.lastName" class="mt-1 text-sm text-red-400">{{ errors.lastName }}</p>
              </div>

              <div>
                <label class="text-gray-400 block mb-2">VATSIM CID</label>
                <input
                  v-model="formData.vatsimCID"
                  type="text"
                  class="w-full bg-[#0a192f] border border-blue-500/30 rounded px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.vatsimCID }"
                >
                <p v-if="errors.vatsimCID" class="mt-1 text-sm text-red-400">{{ errors.vatsimCID }}</p>
              </div>

              <div>
                <label class="text-gray-400 block mb-2">Email</label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="w-full bg-[#0a192f] border border-blue-500/30 rounded px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.email }"
                >
                <p v-if="errors.email" class="mt-1 text-sm text-red-400">{{ errors.email }}</p>
              </div>
            </div>
          </div>

          <!-- Flight Details -->
          <div class="bg-[#001529] rounded-lg p-6 border border-blue-500/20">
            <div class="text-xl text-blue-400 mb-6">Flight Details</div>
            <div class="space-y-6">
              <div>
                <label class="text-gray-400 block mb-2">Aircraft Type</label>
                <input
                  v-model="formData.aircraftType"
                  type="text"
                  class="w-full bg-[#0a192f] border border-blue-500/30 rounded px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.aircraftType }"
                >
                <p v-if="errors.aircraftType" class="mt-1 text-sm text-red-400">{{ errors.aircraftType }}</p>
              </div>

              <div>
                <label class="text-gray-400 block mb-2">Route</label>
                <input
                  v-model="formData.route"
                  type="text"
                  class="w-full bg-[#0a192f] border border-blue-500/30 rounded px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.route }"
                >
                <p v-if="errors.route" class="mt-1 text-sm text-red-400">{{ errors.route }}</p>
              </div>

              <div>
                <label class="text-gray-400 block mb-2">Additional Notes</label>
                <textarea
                  v-model="formData.notes"
                  rows="3"
                  class="w-full bg-[#0a192f] border border-blue-500/30 rounded px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="bg-[#001529] rounded-lg p-6 border border-blue-500/20">
            <div class="text-xl text-blue-400 mb-6 text-center">TERMS AND CONDITIONS</div>
            <div class="text-gray-400 mb-6 text-center">By signing below, I understand and agree to the following terms:</div>
            
            <div class="space-y-4">
              <div class="flex items-start space-x-3 p-4 bg-[#0a192f] rounded border border-blue-500/10">
                <span class="text-xl">✈️</span>
                <p class="text-gray-300">I must push back at my assigned slot time.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-[#0a192f] rounded border border-blue-500/10">
                <span class="text-xl">⚠️</span>
                <p class="text-gray-300">Failure to push back at the assigned slot time may result in removal from this event and/or exclusion from future events.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-[#0a192f] rounded border border-blue-500/10">
                <span class="text-xl">👤</span>
                <p class="text-gray-300">I must actually show up for my assigned slot.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-[#0a192f] rounded border border-blue-500/10">
                <span class="text-xl">🚫</span>
                <p class="text-gray-300">No-shows may be banned from future events.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-[#0a192f] rounded border border-blue-500/10">
                <span class="text-xl">🔒</span>
                <p class="text-gray-300">Slots are non-transferable without prior approval.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-[#0a192f] rounded border border-blue-500/10">
                <span class="text-xl">📋</span>
                <p class="text-gray-300">I must be ready to fly at my assigned time with my flight plan filed.</p>
              </div>

              <div class="flex items-start space-x-3 p-4 bg-[#0a192f] rounded border border-blue-500/10">
                <span class="text-xl">⚡</span>
                <p class="text-gray-300">I understand that failure to comply with these terms may result in immediate removal from the event and potential exclusion from future events.</p>
              </div>
            </div>

            <div class="mt-8">
              <label class="text-gray-400 block mb-2">Electronic Signature</label>
              <input
                v-model="formData.agreementSignature"
                type="text"
                placeholder="Type your full name as signature"
                class="w-full bg-[#0a192f] border border-blue-500/30 rounded px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.agreementSignature }"
              >
              <p v-if="errors.agreementSignature" class="mt-1 text-sm text-red-400">{{ errors.agreementSignature }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded transition-colors"
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
  border: 3px solid rgba(59, 130, 246, 0.1);
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