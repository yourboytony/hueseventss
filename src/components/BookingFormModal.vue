<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import { useBannedUsersStore } from '@/stores/bannedUsers'
import type { Event } from '@/stores/events'

const props = defineProps<{
  event: Event | null
  selectedTime: string
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const eventStore = useEventsStore()
const bannedUsersStore = useBannedUsersStore()

const showSuccess = ref(false)
const isClosing = ref(false)
const isSubmitting = ref(false)

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

const handleClose = () => {
  isClosing.value = true
  setTimeout(() => {
    emit('close')
  }, 300) // Match the CSS transition duration
}

const handleSubmit = async () => {
  if (!validateForm()) {
    console.log('Form validation failed:', errors.value)
    return
  }
  
  try {
    isSubmitting.value = true
    if (!props.event) {
      throw new Error('No event data available')
    }

    // Create the registration object
    const registration = {
      name: `${formData.value.firstName.trim()} ${formData.value.lastName.trim()}`,
      vatsimCid: formData.value.vatsimCID.trim(),
      email: formData.value.email.trim(),
      aircraftType: formData.value.aircraftType.trim(),
      route: formData.value.route.trim(),
      notes: formData.value.notes?.trim() || '',
      registeredAt: new Date().toISOString(),
      selectedTime: props.selectedTime.trim(),
      callsign: formData.value.callsign.toUpperCase().trim()
    }

    // Get fresh event data
    const freshEvent = await eventStore.getEventById(props.event.id)
    if (!freshEvent) {
      throw new Error('Event not found')
    }

    // Check if slot is still available
    const existingRegistration = (freshEvent.registrations || []).find(
      reg => reg?.selectedTime === props.selectedTime
    )
    if (existingRegistration) {
      throw new Error('This time slot has already been taken')
    }

    // Update the event
    const updatedEvent = {
      ...freshEvent,
      registrations: [...(freshEvent.registrations || []), registration],
      availableSlots: Math.max(0, (freshEvent.availableSlots || freshEvent.totalSlots || 20) - 1)
    }

    await eventStore.updateEvent(updatedEvent)
    
    // Show success message
    showSuccess.value = true
    
    // Wait for animation then redirect
    setTimeout(() => {
      router.push({
        name: 'confirmation',
        state: {
          registration: {
            name: registration.name,
            callsign: registration.callsign,
            selectedTime: registration.selectedTime,
            eventName: props.event?.title || 'Event'
          }
        }
      })
    }, 2000)
  } catch (err) {
    console.error('Error submitting booking:', err)
    errors.value.submit = err instanceof Error ? err.message : 'Failed to submit booking'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  // Focus the first input when modal opens
  const firstInput = document.querySelector('.modal-content input') as HTMLInputElement
  if (firstInput) {
    firstInput.focus()
  }
})
</script>

<template>
  <Transition name="modal">
    <div 
      class="modal-overlay" 
      @click.self="handleClose"
      :class="{ 'is-closing': isClosing }"
    >
      <div class="modal-content" :class="{ 'success': showSuccess }">
        <button 
          class="close-button" 
          @click="handleClose"
          :disabled="isSubmitting"
        >&times;</button>
        
        <Transition name="fade" mode="out-in">
          <!-- Success State -->
          <div v-if="showSuccess" class="success-message">
            <div class="success-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <p>Your flight has been successfully booked.</p>
            <p class="success-details">
              Callsign: {{ formData.callsign.toUpperCase() }}<br>
              Time: {{ selectedTime }}
            </p>
            <p class="redirecting">Redirecting to confirmation page...</p>
          </div>

          <!-- Form State -->
          <div v-else class="booking-container">
            <!-- Header -->
            <div class="booking-header">
              <h1>Book Your Flight</h1>
              
              <div v-if="event" class="flight-info-card">
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
                        Selected Time: {{ selectedTime }}
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

              <div v-if="errors.submit" class="error-banner">
                {{ errors.submit }}
              </div>

              <button
                @click="handleSubmit"
                class="submit-button"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner"></span>
                <span v-else>Submit Booking</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 2rem;
  z-index: 1000;
}

.modal-content {
  background-color: #0a192f;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  position: relative;
  margin: 2rem auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateY(0);
  opacity: 1;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.close-button:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

.booking-container {
  color: #fff;
}

/* Rest of the styles from BookEventView.vue */
.booking-header {
  margin-bottom: 2rem;
}

.flight-info-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.flight-info-grid {
  display: grid;
  gap: 1.5rem;
}

.info-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #60a5fa;
}

.flight-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
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
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.input-group input,
.input-group textarea {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  padding: 0.75rem;
  color: #fff;
  font-size: 1rem;
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  transition: all 0.2s ease;
}

.has-error {
  border-color: #ef4444 !important;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
}

.error-banner {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
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

@media (max-width: 640px) {
  .modal-overlay {
    padding: 1rem;
  }

  .modal-content {
    margin: 1rem auto;
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Modal Animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.is-closing .modal-content {
  transform: translateY(20px);
  opacity: 0;
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Success State */
.success-message {
  text-align: center;
  padding: 2rem;
  color: #fff;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 1.5rem;
  animation: success-pop 0.3s ease-out;
}

.success-message h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #22c55e;
}

.success-details {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  font-family: monospace;
  font-size: 1.1rem;
}

.redirecting {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* Loading Spinner */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

/* Submit Button */
.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Animations */
@keyframes success-pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Hover Effects */
.input-group input:hover,
.input-group textarea:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

/* Mobile Responsive Animations */
@media (max-width: 640px) {
  .modal-content {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
  }
  
  .success-icon {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }
}
</style> 