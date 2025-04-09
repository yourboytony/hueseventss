<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import { useBannedUsersStore } from '@/stores/bannedUsers'
import type { Event, Registration } from '@/stores/events'

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
  callsign: '',
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
  if (!formData.value.callsign) {
    newErrors.callsign = 'Callsign is required'
  } else if (!/^[A-Z0-9]{3,7}$/.test(formData.value.callsign.toUpperCase())) {
    newErrors.callsign = 'Please enter a valid callsign (3-7 characters, letters and numbers only)'
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
  if (!validateForm()) {
    console.log('Form validation failed:', errors.value)
    return
  }
  
  try {
    loading.value = true
    error.value = ''
    
    if (!event.value) {
      throw new Error('No event data available')
    }

    // Get the selected time from query parameters
    const selectedTime = route.query.selectedTime as string
    if (!selectedTime) {
      throw new Error('No time slot selected')
    }

    console.log('Creating registration with data:', {
      name: `${formData.value.firstName} ${formData.value.lastName}`,
      callsign: formData.value.callsign.toUpperCase(),
      selectedTime: selectedTime
    })

    // Create the registration object
    const registration: Registration = {
      name: `${formData.value.firstName} ${formData.value.lastName}`,
      vatsimCid: formData.value.vatsimCID,
      email: formData.value.email,
      aircraftType: formData.value.aircraftType,
      route: formData.value.route,
      notes: formData.value.notes || '',
      registeredAt: new Date().toISOString(),
      selectedTime: selectedTime,
      callsign: formData.value.callsign.toUpperCase()
    }

    console.log('Current event data:', event.value)

    // Get fresh event data to ensure we have the latest state
    const freshEvent = await eventStore.getEventById(event.value.id)
    if (!freshEvent) {
      throw new Error('Event not found')
    }

    // Check if the slot is still available
    const existingRegistration = (freshEvent.registrations || []).find(
      reg => reg?.selectedTime === selectedTime
    )
    if (existingRegistration) {
      throw new Error('This time slot has already been taken')
    }

    // Create a complete copy of the event with all required fields
    const updatedEvent = {
      ...freshEvent,
      registrations: freshEvent.registrations ? [...freshEvent.registrations, registration] : [registration],
      availableSlots: Math.max(0, (freshEvent.availableSlots || freshEvent.totalSlots || 20) - 1)
    }

    console.log('Updating event with data:', {
      id: updatedEvent.id,
      registrationsCount: updatedEvent.registrations.length,
      availableSlots: updatedEvent.availableSlots
    })

    // Update the event in Firebase
    await eventStore.updateEvent(updatedEvent)
    console.log('Event updated successfully')

    // Redirect to confirmation page with complete booking details
    router.push({
      name: 'booking-confirmation',
      params: { id: event.value.id },
      query: {
        name: `${formData.value.firstName} ${formData.value.lastName}`,
        callsign: formData.value.callsign.toUpperCase(),
        selectedTime: selectedTime,
        fromICAO: event.value.fromICAO,
        toICAO: event.value.toICAO,
        aircraftType: formData.value.aircraftType
      }
    })
  } catch (err) {
    console.error('Error submitting booking:', err)
    error.value = err instanceof Error ? err.message : 'Failed to submit booking. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Get event ID from route params
    const eventId = route.params.id as string
    if (!eventId) {
      throw new Error('No event ID provided')
    }

    // Get selected time from query parameters
    const selectedTime = route.query.selectedTime as string
    if (!selectedTime) {
      throw new Error('No time slot selected')
    }

    console.log('Retrieved time slot from URL:', selectedTime)

    // Fetch event data
    const foundEvent = await eventStore.getEventById(eventId)
    if (!foundEvent) {
      throw new Error('Flight not found')
    }
    
    event.value = foundEvent
  } catch (err) {
    console.error('Error loading event data:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load flight details'
    // Only redirect if we can't find the event or no time slot is selected
    if (err instanceof Error && 
       (err.message === 'Flight not found' || err.message === 'No time slot selected')) {
      router.replace({ 
        name: 'select-slot', 
        params: { id: route.params.id }
      })
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="booking-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">{{ error }}</div>
    </div>

    <div v-else-if="event" class="booking-container">
      <!-- Header -->
      <div class="booking-header">
        <h1>Book Your Flight</h1>
        
        <div class="flight-info-card">
          <div class="flight-info-grid">
            <div class="info-section">
              <h2>Flight Information</h2>
              <div class="info-content">
                <p class="flight-title">{{ event.title }}</p>
                <p class="info-item">
                  <span class="icon">✈</span>
                  {{ event.fromICAO }} → {{ event.toICAO }}
                </p>
                <p class="info-item">
                  <span class="icon">🕒</span>
                  Selected Time: {{ $route.query.selectedTime }}
                </p>
                <p class="info-item">
                  <span class="icon">⏱</span>
                  Duration: 2h 5m
                </p>
              </div>
            </div>
            
            <div class="info-section">
              <h2>Aircraft Details</h2>
              <div class="info-content">
                <p class="info-item">
                  <span class="icon">🛩</span>
                  Aircraft: A320/A321/A319
                </p>
                <p class="info-item">
                  <span class="icon">📊</span>
                  Flight Level: PILOT DISCRETION
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-sections">
        <!-- Personal Information -->
        <section class="form-section">
          <h2><span class="icon">👤</span> Personal Information</h2>
          
          <div class="form-grid">
            <div class="input-group">
              <label>First Name</label>
              <input
                v-model="formData.firstName"
                type="text"
                :class="{ 'has-error': errors.firstName }"
              >
              <span v-if="errors.firstName" class="error-text">{{ errors.firstName }}</span>
            </div>

            <div class="input-group">
              <label>Last Name</label>
              <input
                v-model="formData.lastName"
                type="text"
                :class="{ 'has-error': errors.lastName }"
              >
              <span v-if="errors.lastName" class="error-text">{{ errors.lastName }}</span>
            </div>

            <div class="input-group">
              <label>VATSIM CID</label>
              <input
                v-model="formData.vatsimCID"
                type="text"
                :class="{ 'has-error': errors.vatsimCID }"
              >
              <span v-if="errors.vatsimCID" class="error-text">{{ errors.vatsimCID }}</span>
            </div>

            <div class="input-group">
              <label>Email Address</label>
              <input
                v-model="formData.email"
                type="email"
                :class="{ 'has-error': errors.email }"
              >
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>

            <div class="input-group">
              <label>Callsign</label>
              <input
                v-model="formData.callsign"
                type="text"
                placeholder="e.g. DAL123"
                :class="{ 'has-error': errors.callsign }"
              >
              <span v-if="errors.callsign" class="error-text">{{ errors.callsign }}</span>
            </div>
          </div>
        </section>

        <!-- Flight Details -->
        <section class="form-section">
          <h2><span class="icon">✈</span> Flight Details</h2>
          
          <div class="form-stack">
            <div class="input-group">
              <label>Aircraft Type</label>
              <input
                v-model="formData.aircraftType"
                type="text"
                :class="{ 'has-error': errors.aircraftType }"
              >
              <span v-if="errors.aircraftType" class="error-text">{{ errors.aircraftType }}</span>
            </div>

            <div class="input-group">
              <label>Route</label>
              <input
                v-model="formData.route"
                type="text"
                :class="{ 'has-error': errors.route }"
              >
              <span v-if="errors.route" class="error-text">{{ errors.route }}</span>
            </div>

            <div class="input-group">
              <label>Additional Notes</label>
              <textarea
                v-model="formData.notes"
                rows="3"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- Terms and Conditions -->
        <section class="form-section">
          <h2><span class="icon">📋</span> Terms and Conditions</h2>

          <div class="terms-container">
            <div class="terms-list">
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

          <div class="input-group signature-group">
            <label>Electronic Signature</label>
            <input
              v-model="formData.agreementSignature"
              type="text"
              placeholder="Type your full name to agree to the terms"
              :class="{ 'has-error': errors.agreementSignature }"
            >
            <span v-if="errors.agreementSignature" class="error-text">{{ errors.agreementSignature }}</span>
          </div>
        </section>

        <button
          @click="handleSubmit"
          class="submit-button"
        >
          Submit Booking
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-page {
  min-height: 100vh;
  background-color: #0a192f;
  color: #fff;
  padding: 2rem 1rem;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #f87171;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.booking-container {
  max-width: 1200px;
  margin: 0 auto;
}

.booking-header {
  margin-bottom: 3rem;
  text-align: center;
}

.booking-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  background: linear-gradient(to right, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.flight-info-card {
  background: rgba(30, 58, 138, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(8px);
}

.flight-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .flight-info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.info-section h2 {
  color: #60a5fa;
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.flight-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
}

.icon {
  color: #60a5fa;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  padding: 2rem;
}

.form-section h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
}

.input-group input,
.input-group textarea {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: #fff;
  transition: all 0.2s;
}

.input-group input:hover,
.input-group textarea:hover {
  border-color: rgba(59, 130, 246, 0.4);
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.input-group input.has-error,
.input-group textarea.has-error {
  border-color: #ef4444;
}

.error-text {
  color: #f87171;
  font-size: 0.875rem;
}

.terms-container {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.terms-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.term-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #94a3b8;
}

.term-icon {
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.signature-group {
  margin-top: 1.5rem;
}

.submit-button {
  width: 100%;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: #fff;
  font-size: 1.125rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.submit-button:hover {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
  transform: translateY(-1px);
}

.submit-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #3b82f6;
}

.submit-button:active {
  transform: translateY(0);
}
</style> 