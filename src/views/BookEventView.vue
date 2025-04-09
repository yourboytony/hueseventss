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
      <div class="loading"></div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-red-400">{{ error }}</div>
    </div>

    <div v-else-if="event" class="max-w-4xl mx-auto py-8 px-4">
      <div class="text-2xl mb-6">Book Your Flight</div>
      <div class="text-gray-400 mb-8">
        {{ event.title }}
        <br>
        {{ event.fromICAO }} → {{ event.toICAO }}
        <br>
        Selected Time: 06:00Z
        <br>
        Duration: 2h 5m
        <br>
        Aircraft: A320/A321/A319
        <br>
        Flight Level: FLPILOT DISCRETION
      </div>

      <div class="text-xl mb-4">Personal Information</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label class="block text-gray-400 mb-1">First Name</label>
          <input
            v-model="formData.firstName"
            type="text"
            class="input"
            :class="{ 'error': errors.firstName }"
          >
          <div v-if="errors.firstName" class="error-text">{{ errors.firstName }}</div>
        </div>

        <div>
          <label class="block text-gray-400 mb-1">Last Name</label>
          <input
            v-model="formData.lastName"
            type="text"
            class="input"
            :class="{ 'error': errors.lastName }"
          >
          <div v-if="errors.lastName" class="error-text">{{ errors.lastName }}</div>
        </div>

        <div>
          <label class="block text-gray-400 mb-1">VATSIM CID</label>
          <input
            v-model="formData.vatsimCID"
            type="text"
            class="input"
            :class="{ 'error': errors.vatsimCID }"
          >
          <div v-if="errors.vatsimCID" class="error-text">{{ errors.vatsimCID }}</div>
        </div>

        <div>
          <label class="block text-gray-400 mb-1">Email</label>
          <input
            v-model="formData.email"
            type="email"
            class="input"
            :class="{ 'error': errors.email }"
          >
          <div v-if="errors.email" class="error-text">{{ errors.email }}</div>
        </div>
      </div>

      <div class="text-xl mb-4">Flight Details</div>
      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-gray-400 mb-1">Aircraft Type</label>
          <input
            v-model="formData.aircraftType"
            type="text"
            class="input"
            :class="{ 'error': errors.aircraftType }"
          >
          <div v-if="errors.aircraftType" class="error-text">{{ errors.aircraftType }}</div>
        </div>

        <div>
          <label class="block text-gray-400 mb-1">Route</label>
          <input
            v-model="formData.route"
            type="text"
            class="input"
            :class="{ 'error': errors.route }"
          >
          <div v-if="errors.route" class="error-text">{{ errors.route }}</div>
        </div>

        <div>
          <label class="block text-gray-400 mb-1">Additional Notes</label>
          <textarea
            v-model="formData.notes"
            rows="3"
            class="input"
          ></textarea>
        </div>
      </div>

      <div class="text-xl mb-4">TERMS AND CONDITIONS</div>
      <div class="text-gray-400 mb-4">By signing below, I understand and agree to the following terms:</div>

      <div class="space-y-3 mb-8">
        <div class="flex gap-2">
          <span>✈️</span>
          <div class="text-gray-400">I must push back at my assigned slot time.</div>
        </div>
        <div class="flex gap-2">
          <span>⚠️</span>
          <div class="text-gray-400">Failure to push back at the assigned slot time may result in removal from this event and/or exclusion from future events.</div>
        </div>
        <div class="flex gap-2">
          <span>👤</span>
          <div class="text-gray-400">I must actually show up for my assigned slot.</div>
        </div>
        <div class="flex gap-2">
          <span>🚫</span>
          <div class="text-gray-400">No-shows may be banned from future events.</div>
        </div>
        <div class="flex gap-2">
          <span>🔒</span>
          <div class="text-gray-400">Slots are non-transferable without prior approval.</div>
        </div>
        <div class="flex gap-2">
          <span>📋</span>
          <div class="text-gray-400">I must be ready to fly at my assigned time with my flight plan filed.</div>
        </div>
        <div class="flex gap-2">
          <span>⚡</span>
          <div class="text-gray-400">I understand that failure to comply with these terms may result in immediate removal from the event and potential exclusion from future events.</div>
        </div>
      </div>

      <div class="mb-8">
        <label class="block text-gray-400 mb-1">Electronic Signature</label>
        <input
          v-model="formData.agreementSignature"
          type="text"
          placeholder="Type your full name as signature"
          class="input"
          :class="{ 'error': errors.agreementSignature }"
        >
        <div v-if="errors.agreementSignature" class="error-text">{{ errors.agreementSignature }}</div>
      </div>

      <button
        @click="handleSubmit"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Submit Booking
      </button>
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
  @apply w-full bg-[#0a192f] border border-gray-600 rounded px-3 py-2 text-white;
}

.input:focus {
  @apply outline-none border-blue-500 ring-1 ring-blue-500;
}

.input.error {
  @apply border-red-500;
}

.error-text {
  @apply text-sm text-red-400 mt-1;
}
</style> 