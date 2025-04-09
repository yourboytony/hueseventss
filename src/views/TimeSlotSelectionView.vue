<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import type { Event } from '@/stores/events'
import PageTransition from '@/components/PageTransition.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import GlowButton from '@/components/GlowButton.vue'
import MobileContainer from '@/components/MobileContainer.vue'

const route = useRoute()
const router = useRouter()
const eventStore = useEventsStore()
const event = ref<Event | null>(null)
const loading = ref(true)
const error = ref('')
const showZulu = ref(false)

// Add transition control
const showContent = ref(false)

// Helper function to parse time string to Date
const parseTimeString = (timeStr: string, baseDate: Date) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  // Create a new date object in local time
  const localDate = new Date(baseDate)
  localDate.setHours(hours, minutes, 0, 0)
  return localDate
}

const formatTimeSlot = (date: Date, useZulu: boolean) => {
  if (useZulu) {
    // For Zulu time, convert local to UTC and append 'Z'
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    const timeString = utcDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    })
    return timeString + 'Z'
  }

  // For local time, use the date directly
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  }).replace(/\s/g, '')
}

const timeSlots = computed(() => {
  if (!event.value) return []
  
  try {
    const slots = []
    // Parse the event date string into a Date object
    const eventDate = new Date(event.value.date)
    if (isNaN(eventDate.getTime())) {
      console.error('Invalid event date:', event.value.date)
      return []
    }
    
    // Get start and end times in local time
    const startTime = parseTimeString(event.value.time || '00:00', eventDate)
    const endTime = parseTimeString(event.value.endTime || '23:59', eventDate)
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.error('Invalid time format:', { start: event.value.time, end: event.value.endTime })
      return []
    }
    
    // Calculate total duration in minutes
    const totalDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    if (totalDuration <= 0) {
      console.error('Invalid duration:', totalDuration)
      return []
    }
    
    // Calculate number of slots based on slot duration
    const slotDuration = event.value.slotDurationMinutes || 2
    const numberOfSlots = Math.floor(totalDuration / slotDuration)
    
    // Get already booked slots
    const bookedSlots = new Set(
      (event.value.registrations || []).map(reg => reg.selectedTime)
    )
    
    // Calculate maximum slots based on total slots or available slots
    const maxSlots = Math.min(
      numberOfSlots,
      event.value.totalSlots || 20
    )
    
    for (let i = 0; i < maxSlots; i++) {
      // Create a new Date object for each slot
      const slotTime = new Date(startTime)
      // Add the slot duration
      slotTime.setMinutes(slotTime.getMinutes() + (i * slotDuration))
      
      // For storing in Zulu time, convert to UTC
      const utcSlotTime = new Date(slotTime.getTime() + slotTime.getTimezoneOffset() * 60000)
      const timeString = formatTimeSlot(utcSlotTime, true) // Store in Zulu time
      
      // Create a new Date for comparison that accounts for timezone
      const now = new Date()
      
      slots.push({
        time: formatTimeSlot(slotTime, showZulu.value),
        available: !bookedSlots.has(timeString) && slotTime > now,
        rawTime: slotTime,
        zulu: timeString // Store Zulu time for booking
      })
    }
    
    return slots
  } catch (error) {
    console.error('Error calculating time slots:', error)
    return []
  }
})

const formatEventDate = (date: string) => {
  // Create a UTC date by parsing the YYYY-MM-DD format
  const [year, month, day] = date.split('-').map(Number)
  const utcDate = new Date(Date.UTC(year, month - 1, day))
  
  return utcDate.toLocaleDateString([], { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'  // Ensure we use UTC for the date
  })
}

const formatZuluTime = (timeStr: string | undefined, date: string) => {
  if (!timeStr) return '--:--'
  
  const [hours, minutes] = timeStr.split(':').map(Number)
  if (isNaN(hours) || isNaN(minutes)) return '--:--'
  
  // Create date in local time zone
  const localDate = new Date(date)
  localDate.setHours(hours, minutes, 0, 0)
  
  // Convert to UTC by adding the timezone offset
  const utcDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000)
  
  // Format in 24-hour time
  return utcDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  })
}

onMounted(async () => {
  try {
    const eventId = route.params.id as string
    if (!eventId) {
      throw new Error('No event ID provided')
    }
    
    // First fetch all events if they haven't been loaded yet
    if (!eventStore.events || eventStore.events.length === 0) {
      console.log('Fetching events...')
      await eventStore.fetchEvents()
      
      // Double check that events were loaded
      if (!eventStore.events || eventStore.events.length === 0) {
        throw new Error('Failed to load events')
      }
    }
    
    console.log('Looking for event:', eventId)
    console.log('Available events:', eventStore.events)
    
    // Find the event in the store
    const foundEvent = eventStore.events.find(e => e.id === eventId)
    if (!foundEvent) {
      throw new Error(`Flight not found with ID: ${eventId}`)
    }
    
    // Validate required event properties
    if (!foundEvent.date || !foundEvent.time) {
      throw new Error('Invalid event data: missing required properties (date or time)')
    }
    
    event.value = foundEvent
    // Delay showing content for smooth transition
    setTimeout(() => {
      loading.value = false
      showContent.value = true
    }, 1000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load flight details. Please try again.'
    console.error('Error loading flight:', err)
    loading.value = false
  }
})

const selectSlot = (slot: { time: string, zulu: string }) => {
  router.push({
    name: 'book-event',
    params: { id: route.params.id },
    query: { selectedTime: slot.zulu } // Always store Zulu time
  })
}
</script>

<template>
  <LoadingScreen v-if="loading" message="Preparing your flight details..." />
  
  <PageTransition name="scale">
    <div v-if="showContent" class="events-page">
      <div class="hero-section">
        <AnimatedBackground variant="stars" />
        <div class="hero-content">
          <h1>Select Flight Time</h1>
          <p class="subtitle">Choose your preferred departure time</p>
        </div>
      </div>

      <div class="content-wrapper">
        <div v-if="error" class="error">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="event" class="event-details">
          <transition-group 
            name="fade-slide" 
            tag="div"
            appear
          >
            <!-- Flight Card -->
            <div key="flight-card" class="flight-card">
              <div class="flight-header">
                <h2>{{ event.title }}</h2>
                <div class="notification-banner">
                  {{ event.registrations.length }} slots booked
                </div>
              </div>

              <div class="flight-info">
                <div class="route-info">
                  <div class="airport-info from">
                    <span class="icao">{{ event.fromICAO }}</span>
                    <div class="pulse-ring"></div>
                  </div>
                  <div class="flight-path">
                    <div class="path-line">
                      <div class="airplane">✈</div>
                    </div>
                    <span class="duration">{{ event.estimatedDuration }}</span>
                  </div>
                  <div class="airport-info to">
                    <span class="icao">{{ event.toICAO }}</span>
                    <div class="pulse-ring"></div>
                  </div>
                </div>

                <div class="flight-details">
                  <div class="detail-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 7V3m8 4V3M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>{{ formatEventDate(event.date) }}</span>
                  </div>
                  <div class="detail-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 19l9 2-9-18-9 18l9-2zm0 0v-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>{{ event.aircraft }}</span>
                  </div>
                  <div class="detail-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>FL{{ event.flightLevel }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Time Slot Selection -->
            <div key="slot-selection" class="slot-selection">
              <div class="timezone-section">
                <div class="timezone-info">
                  <svg class="clock-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L14 14M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>Times shown in {{ showZulu ? 'Zulu (UTC)' : 'your local' }} timezone</span>
                </div>
                <GlowButton 
                  @click="showZulu = !showZulu"
                  variant="secondary"
                  size="sm"
                >
                  Show {{ showZulu ? 'Local' : 'Zulu' }} Time
                </GlowButton>
              </div>

              <div class="slots-grid">
                <button
                  v-for="slot in timeSlots"
                  :key="slot.time"
                  class="slot-card"
                  :class="{ 'taken': !slot.available }"
                  :disabled="!slot.available"
                  @click="selectSlot(slot)"
                >
                  <div class="time">{{ slot.time }}</div>
                  <div class="status" :class="{ 'taken': !slot.available }">
                    {{ slot.available ? 'Available' : 'Taken' }}
                  </div>
                  <div v-if="slot.available" class="hover-effect"></div>
                </button>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </PageTransition>
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
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #002d65 0%, #001529 100%);
  z-index: 1;
}

.hero-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 50px 160px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0));
  background-size: 200px 200px;
  animation: stars 8s linear infinite;
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 2rem;
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

.event-details {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  margin-bottom: 2rem;
}

.flight-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
}

.flight-header {
  padding: 1.25rem 1.5rem;
  background: #002d65;
  color: white;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flight-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.notification-banner {
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
  background: #3b82f6;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.01em;
}

.flight-info {
  padding: 1.25rem;
}

.route-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: #f8faff;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.airport-info {
  text-align: center;
  position: relative;
}

.icao {
  font-size: 1.25rem;
  font-weight: 600;
  color: #002d65;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.05em;
}

.flight-path {
  position: relative;
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.path-line {
  position: relative;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    rgba(59, 130, 246, 0.2),
    rgba(59, 130, 246, 0.4) 50%,
    rgba(59, 130, 246, 0.2)
  );
}

.airplane {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%) rotate(0deg);
  font-size: 1rem;
  color: #3b82f6;
  animation: fly 4s linear infinite;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #3b82f6;
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.duration {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.flight-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8faff;
  border-radius: 0.375rem;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.detail-item .icon {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
}

.detail-item span {
  font-size: 0.875rem;
  font-weight: 500;
}

.slot-selection {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.slot-card {
  background: #f8faff;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slot-card:not(.taken):hover {
  transform: translateY(-2px);
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.slot-card.taken {
  background: #f3f4f6;
  border-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.7;
}

.time {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.status {
  font-size: 0.875rem;
  font-weight: 500;
}

.status:not(.taken) {
  color: #059669;
}

.status.taken {
  color: #dc2626;
}

.timezone-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.timezone-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
}

.clock-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
}

.timezone-toggle {
  padding: 0.5rem 1rem;
  background: #002d65;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timezone-toggle:hover {
  background: #001f4b;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .flight-details {
    grid-template-columns: 1fr;
  }
  
  .flight-path {
    width: 120px;
  }
  
  .icao {
    font-size: 1rem;
  }
  
  .notification-banner {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  .slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .timezone-section {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
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
  animation: spin 1s linear infinite;
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
  
  .slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
    gap: 0.5rem;
  }
}

.time-zulu {
  font-family: monospace;
  font-weight: 500;
}

.slot-card .time {
  font-family: monospace;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

/* Add new transition styles */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Stagger children animations */
.fade-slide-enter-active > * {
  transition: all 0.5s ease;
}

.fade-slide-enter-active > *:nth-child(1) {
  transition-delay: 0.1s;
}

.fade-slide-enter-active > *:nth-child(2) {
  transition-delay: 0.2s;
}

/* Add hover effects */
.flight-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.flight-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.06);
}

.slot-card {
  transition: all 0.3s ease;
}

.slot-card:not(.taken):hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 16px -2px rgba(59, 130, 246, 0.15);
}

/* Add pulse animation to available slots */
@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.slot-card:not(.taken) {
  animation: pulse-border 2s infinite;
}

/* Enhance the hero section */
.hero-section {
  position: relative;
  overflow: hidden;
}

.hero-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0,45,101,0.7) 0%, rgba(0,21,41,0.7) 100%);
  z-index: 1;
}

.hero-content h1 {
  animation: slideDown 0.5s ease-out 0.5s both;
}

.hero-content .subtitle {
  animation: slideUp 0.5s ease-out 0.7s both;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Add smooth transition for timezone toggle */
.timezone-toggle {
  transition: all 0.3s ease;
}

.timezone-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px -2px rgba(0, 45, 101, 0.2);
}

.timezone-info {
  transition: all 0.3s ease;
}

/* Add animation for the notification banner */
.notification-banner {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.slot-card .hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at center,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(59, 130, 246, 0) 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.slot-card:hover .hover-effect {
  opacity: 1;
}

@keyframes fly {
  0% {
    left: 0;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    left: 100%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0.3;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

/* Enhanced card hover effects */
.flight-card {
  position: relative;
  transition: all 0.3s ease;
}

.flight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg,
    rgba(59, 130, 246, 0.1),
    rgba(163, 194, 255, 0.1)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.flight-card:hover::before {
  opacity: 1;
}

/* Enhanced notification banner */
.notification-banner {
  position: relative;
  overflow: hidden;
}

.notification-banner::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  20% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

/* Responsive enhancements */
@media (max-width: 768px) {
  .flight-path {
    width: 120px;
  }
  
  .pulse-ring {
    width: 30px;
    height: 30px;
  }
  
  .slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .flight-card {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .slot-card {
    background: rgba(255, 255, 255, 0.03);
  }
}
</style> 