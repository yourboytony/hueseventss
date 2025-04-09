<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from '@/stores/events'
import { useBannedUsersStore } from '@/stores/bannedUsers'
import type { Event } from '@/stores/events'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
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
    
    if (eventStore.events.length === 0) {
      await eventStore.fetchEvents()
    }
    
    const foundEvent = eventStore.events.find(e => e.id === eventId)
    if (!foundEvent) {
      throw new Error('Flight not found')
    }
    
    event.value = foundEvent
  } catch (err) {
    error.value = 'Failed to load flight details. Please try again.'
    console.error('Error loading flight:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="events-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1>Book Your Flight</h1>
        <p class="subtitle">Complete your booking details</p>
      </div>
      <div class="hero-background"></div>
    </div>

    <div class="content-wrapper">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading flight details...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="event" class="booking-container">
        <!-- Flight Summary -->
        <div class="flight-info">
          <h2>{{ event.title }}</h2>
          <div class="route">
            <span class="airport">{{ event.fromICAO }}</span>
            <span class="arrow">→</span>
            <span class="airport">{{ event.toICAO }}</span>
          </div>
          <div class="meta">
            <div class="meta-item">
              <span class="meta-label">Selected Time</span>
              <span class="meta-value">{{ selectedTime }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Aircraft</span>
              <span class="meta-value">{{ event.aircraft }}</span>
            </div>
          </div>
        </div>

        <!-- Booking Form -->
        <form @submit.prevent="handleSubmit" class="booking-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                :class="{ 'error': errors.firstName }"
                placeholder="Enter your first name"
              >
              <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                :class="{ 'error': errors.lastName }"
                placeholder="Enter your last name"
              >
              <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
            </div>

            <div class="form-group">
              <label for="vatsimCID">VATSIM CID</label>
              <input
                id="vatsimCID"
                v-model="formData.vatsimCID"
                type="text"
                :class="{ 'error': errors.vatsimCID }"
                placeholder="Enter your VATSIM CID"
              >
              <span v-if="errors.vatsimCID" class="error-message">{{ errors.vatsimCID }}</span>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                :class="{ 'error': errors.email }"
                placeholder="Enter your email"
              >
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>
          </div>

          <div class="form-group full-width">
            <label for="aircraftType">Aircraft Type</label>
            <input
              id="aircraftType"
              v-model="formData.aircraftType"
              type="text"
              :class="{ 'error': errors.aircraftType }"
              placeholder="Enter the aircraft type (e.g., B738, A320)"
            >
            <span v-if="errors.aircraftType" class="error-message">{{ errors.aircraftType }}</span>
          </div>

          <div class="form-group full-width">
            <label for="route">Route</label>
            <input
              id="route"
              v-model="formData.route"
              type="text"
              :class="{ 'error': errors.route }"
              placeholder="Enter your planned route"
            >
            <span v-if="errors.route" class="error-message">{{ errors.route }}</span>
          </div>

          <div class="form-group full-width">
            <label for="notes">Notes</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              rows="3"
              placeholder="Any additional notes or comments?"
            ></textarea>
          </div>

          <div class="terms-section">
            <h3>TERMS AND CONDITIONS</h3>
            <div class="terms-content">
              <p class="terms-header">By signing below, I understand and agree to the following terms:</p>
              <ul>
                <li>✈️ I must push back at my assigned slot time.</li>
                <li>⚠️ Failure to push back at the assigned slot time may result in removal from this event and/or exclusion from future events.</li>
                <li>⏰ I must actually show up for my assigned slot.</li>
                <li>🚫 No-shows may be banned from future events.</li>
                <li>🔒 Slots are non-transferable without prior approval.</li>
                <li>📋 I must be ready to fly at my assigned time with my flight plan filed.</li>
                <li>⚡ I understand that failure to comply with these terms may result in immediate removal from the event and potential exclusion from future events.</li>
              </ul>
            </div>
            
            <div class="form-group signature-section">
              <label for="agreementSignature">Electronic Signature</label>
              <input
                id="agreementSignature"
                v-model="formData.agreementSignature"
                type="text"
                :class="{ 'error': errors.agreementSignature }"
                placeholder="Type your full name as signature"
              >
              <span class="signature-help">Please type your full name as it appears above to indicate your agreement</span>
              <span v-if="errors.agreementSignature" class="error-message">{{ errors.agreementSignature }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.events-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.hero-section {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  overflow: hidden;
  animation: fadeIn 0.8s ease-out;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #002d65 0%, #001529 100%);
  z-index: 1;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 2rem;
  animation: slideUp 0.6s ease-out;
}

h1 {
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #ffffff, #a3c2ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.2rem;
  margin: 1rem 0 0;
  opacity: 0.9;
}

.content-wrapper {
  max-width: 1200px;
  margin: -50px auto 0;
  padding: 0 2rem 4rem;
  position: relative;
  z-index: 2;
}

.booking-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  animation: fadeIn 0.8s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.booking-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -1px rgba(0, 0, 0, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.flight-info {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.flight-info h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #002d65;
  margin-bottom: 1rem;
}

.route {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  animation: slideRight 0.6s ease-out;
}

.airport {
  font-size: 1.5rem;
  font-weight: 600;
  color: #002d65;
  transition: transform 0.2s ease, color 0.2s ease;
}

.airport:hover {
  color: #3b82f6;
  transform: scale(1.05);
}

.arrow {
  color: #3b82f6;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.meta-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.meta-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #002d65;
}

.booking-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s ease;
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

input, textarea {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #ffffff;
}

input:hover, textarea:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

input.error, textarea.error {
  border-color: #dc2626;
}

.error-message {
  font-size: 0.875rem;
  color: #dc2626;
  animation: slideDown 0.3s ease-out;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.submit-button {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #002d65 0%, #004299 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-button:hover {
  background: linear-gradient(135deg, #004299 0%, #002d65 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 45, 101, 0.3);
}

.submit-button:active {
  transform: translateY(0);
}

.loading, .error {
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #002d65;
  border-radius: 50%;
  animation: spin 1s linear infinite, fadeIn 0.5s ease-out;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #dc2626;
}

@keyframes stars {
  from { transform: translateY(0); }
  to { transform: translateY(-200px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: 250px;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
  }
  
  .content-wrapper {
    padding: 0 1rem 2rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
  
  .route {
    flex-direction: row;
    gap: 1rem;
  }
  
  .airport {
    font-size: 1.25rem;
  }
  
  .meta {
    flex-direction: column;
    gap: 1rem;
  }
}

.terms-section {
  margin: 2rem 0;
  padding: 2.5rem;
  background: #ffffff;
  border-radius: 0.75rem;
  border: 2px solid #002d65;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.terms-section:hover {
  box-shadow: 0 8px 15px -3px rgba(0, 45, 101, 0.1);
  border-color: #3b82f6;
}

.terms-section h3 {
  color: #002d65;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.05em;
}

.terms-content {
  margin-bottom: 2rem;
}

.terms-header {
  font-size: 1.25rem;
  color: #002d65;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.terms-content ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.terms-content li {
  margin-bottom: 1rem;
  color: #1a1a1a;
  font-size: 1.1rem;
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 4px solid #002d65;
  transition: all 0.2s ease;
}

.terms-content li:hover {
  background: #f0f7ff;
  border-left-color: #3b82f6;
  transform: translateX(4px);
}

.signature-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.signature-section label {
  font-size: 1.1rem;
  color: #002d65;
  font-weight: 600;
}

.signature-help {
  font-size: 1rem;
  color: #4b5563;
  margin-top: 0.5rem;
  font-weight: 500;
}
</style> 