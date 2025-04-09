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
  <div class="min-h-screen bg-gradient-to-b from-[#0a192f] to-[#112240] text-white">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="loading"></div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-red-400">{{ error }}</div>
    </div>

    <div v-else-if="event" class="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold mb-4">Book Your Flight</h1>
        <div class="bg-[#1a2c4e] rounded-lg p-6 shadow-xl border border-blue-500/20">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 class="text-xl font-semibold text-blue-400 mb-3">Flight Details</h2>
              <div class="space-y-2 text-gray-300">
                <p class="font-medium">{{ event.title }}</p>
                <p>{{ event.fromICAO }} → {{ event.toICAO }}</p>
                <p>Selected Time: 06:00Z</p>
                <p>Duration: 2h 5m</p>
              </div>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-blue-400 mb-3">Aircraft Information</h2>
              <div class="space-y-2 text-gray-300">
                <p>Aircraft: A320/A321/A319</p>
                <p>Flight Level: PILOT DISCRETION</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="bg-[#1a2c4e] rounded-lg p-8 shadow-xl border border-blue-500/20">
        <!-- Personal Information -->
        <div class="mb-10">
          <h2 class="text-2xl font-semibold mb-6 text-blue-400 border-b border-blue-500/20 pb-2">
            Personal Information
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-300 mb-2 font-medium">First Name</label>
              <input
                v-model="formData.firstName"
                type="text"
                class="input"
                :class="{ 'error': errors.firstName }"
              >
              <div v-if="errors.firstName" class="error-text">{{ errors.firstName }}</div>
            </div>

            <div>
              <label class="block text-gray-300 mb-2 font-medium">Last Name</label>
              <input
                v-model="formData.lastName"
                type="text"
                class="input"
                :class="{ 'error': errors.lastName }"
              >
              <div v-if="errors.lastName" class="error-text">{{ errors.lastName }}</div>
            </div>

            <div>
              <label class="block text-gray-300 mb-2 font-medium">VATSIM CID</label>
              <input
                v-model="formData.vatsimCID"
                type="text"
                class="input"
                :class="{ 'error': errors.vatsimCID }"
              >
              <div v-if="errors.vatsimCID" class="error-text">{{ errors.vatsimCID }}</div>
            </div>

            <div>
              <label class="block text-gray-300 mb-2 font-medium">Email</label>
              <input
                v-model="formData.email"
                type="email"
                class="input"
                :class="{ 'error': errors.email }"
              >
              <div v-if="errors.email" class="error-text">{{ errors.email }}</div>
            </div>
          </div>
        </div>

        <!-- Flight Details -->
        <div class="mb-10">
          <h2 class="text-2xl font-semibold mb-6 text-blue-400 border-b border-blue-500/20 pb-2">
            Flight Details
          </h2>
          <div class="space-y-6">
            <div>
              <label class="block text-gray-300 mb-2 font-medium">Aircraft Type</label>
              <input
                v-model="formData.aircraftType"
                type="text"
                class="input"
                :class="{ 'error': errors.aircraftType }"
              >
              <div v-if="errors.aircraftType" class="error-text">{{ errors.aircraftType }}</div>
            </div>

            <div>
              <label class="block text-gray-300 mb-2 font-medium">Route</label>
              <input
                v-model="formData.route"
                type="text"
                class="input"
                :class="{ 'error': errors.route }"
              >
              <div v-if="errors.route" class="error-text">{{ errors.route }}</div>
            </div>

            <div>
              <label class="block text-gray-300 mb-2 font-medium">Additional Notes</label>
              <textarea
                v-model="formData.notes"
                rows="3"
                class="input resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="mb-10">
          <h2 class="text-2xl font-semibold mb-6 text-blue-400 border-b border-blue-500/20 pb-2">
            Terms and Conditions
          </h2>
          <div class="bg-[#112240] rounded-lg p-6 mb-6 border border-blue-500/10">
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <span class="mt-1">✈️</span>
                <div class="text-gray-300">I must push back at my assigned slot time.</div>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1">⚠️</span>
                <div class="text-gray-300">Failure to push back at the assigned slot time may result in removal from this event and/or exclusion from future events.</div>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1">👤</span>
                <div class="text-gray-300">I must actually show up for my assigned slot.</div>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1">🚫</span>
                <div class="text-gray-300">No-shows may be banned from future events.</div>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1">🔒</span>
                <div class="text-gray-300">Slots are non-transferable without prior approval.</div>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1">📋</span>
                <div class="text-gray-300">I must be ready to fly at my assigned time with my flight plan filed.</div>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1">⚡</span>
                <div class="text-gray-300">I understand that failure to comply with these terms may result in immediate removal from the event and potential exclusion from future events.</div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-gray-300 mb-2 font-medium">Electronic Signature</label>
            <input
              v-model="formData.agreementSignature"
              type="text"
              placeholder="Type your full name as signature"
              class="input"
              :class="{ 'error': errors.agreementSignature }"
            >
            <div v-if="errors.agreementSignature" class="error-text">{{ errors.agreementSignature }}</div>
          </div>
        </div>

        <button
          @click="handleSubmit"
          class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1a2c4e]"
        >
          Submit Booking
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading {
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

.input {
  @apply w-full bg-[#112240] border border-blue-500/20 rounded-lg px-4 py-2.5 text-white transition-colors;
}

.input:focus {
  @apply outline-none border-blue-500 ring-1 ring-blue-500;
}

.input:hover:not(:focus) {
  @apply border-blue-500/40;
}

.input.error {
  @apply border-red-500;
}

.error-text {
  @apply text-sm text-red-400 mt-2;
}
</style> 