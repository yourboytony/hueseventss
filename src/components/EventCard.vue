<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Event } from '@/stores/events'
import NotificationBanner from './NotificationBanner.vue'

const props = defineProps<{
  event: Event
}>()

const router = useRouter()

const availableSlots = computed(() => {
  const totalSlots = Number(props.event.totalSlots) || 0
  const registrationsCount = props.event.registrations?.length || 0
  return Math.max(0, totalSlots - registrationsCount)
})

const showNotification = computed(() => {
  const now = new Date()
  const eventDate = new Date(props.event.date + 'T' + props.event.time)
  
  // Check if event is live (within 30 minutes of start time)
  const timeDiff = Math.abs(eventDate.getTime() - now.getTime())
  const minutesDiff = Math.floor(timeDiff / (1000 * 60))
  
  if (minutesDiff <= 30 && eventDate > now) {
    return {
      message: 'Flight is about to depart!',
      type: 'live' as const
    }
  }
  
  // Check if event was added in last 24 hours
  const createdAt = new Date(props.event.createdAt)
  const hoursSinceCreated = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
  
  if (hoursSinceCreated <= 24) {
    return {
      message: 'New Flight Added',
      type: 'new' as const
    }
  }
  
  return null
})

const handleBookClick = () => {
  if (availableSlots.value > 0) {
    router.push({ name: 'select-slot', params: { id: props.event.id } })
  }
}
</script>

<template>
  <div class="event-card">
    <NotificationBanner 
      v-if="showNotification"
      :message="showNotification.message"
      :type="showNotification.type"
    />
    <div class="event-image" v-if="event.imageUrl">
      <img :src="event.imageUrl" :alt="event.title">
    </div>
    <div class="event-content">
      <div class="event-header">
        <h3>{{ event.title }}</h3>
        <div class="slots-badge" :class="{ 'no-slots': availableSlots === 0 }">
          {{ availableSlots }} slots left
        </div>
      </div>
      
      <p class="description">{{ event.description }}</p>
      
      <div class="flight-info">
        <div class="route">
          <div class="airport">
            <span class="icao">{{ event.fromICAO }}</span>
            <span class="label">Departure</span>
          </div>
          <div class="arrow">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="airport">
            <span class="icao">{{ event.toICAO }}</span>
            <span class="label">Arrival</span>
          </div>
        </div>
        
        <div class="details-grid">
          <div class="detail-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>{{ event.time }}</span>
          </div>
          <div class="detail-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" stroke-width="2"/>
              <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
              <path d="M8 2L8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M16 2L16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>{{ event.date }}</span>
          </div>
          <div class="detail-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>{{ event.estimatedDuration }}</span>
          </div>
          <div class="detail-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ event.aircraft }}</span>
          </div>
        </div>
      </div>
      
      <button 
        class="book-button" 
        @click="handleBookClick"
        :disabled="availableSlots === 0"
      >
        {{ availableSlots === 0 ? 'No Slots Available' : 'Book Flight' }}
        <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.event-card {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.event-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-content {
  padding: 1.5rem;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

h3 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.25rem;
  font-weight: 600;
}

.slots-badge {
  background: #e6f4ea;
  color: #1e7e34;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.slots-badge.no-slots {
  background: #f8d7da;
  color: #dc3545;
}

.description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.flight-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.airport {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icao {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.label {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
}

.arrow {
  color: #666;
}

.arrow svg {
  width: 24px;
  height: 24px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.icon {
  width: 16px;
  height: 16px;
}

.book-button {
  width: 100%;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.book-button:hover:not(:disabled) {
  background: var(--accent-color);
}

.book-button:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .event-image {
    height: 160px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style> 