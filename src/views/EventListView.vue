<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useEventsStore } from '@/stores/events'
import EventCard from '@/components/EventCard.vue'

const eventStore = useEventsStore()

onMounted(async () => {
  console.log('EventListView mounted, fetching events...')
  await eventStore.fetchEvents()
  console.log('Events fetched:', eventStore.events)
})

// Watch for changes in events
watch(() => eventStore.events, (newEvents) => {
  console.log('Events updated:', newEvents)
}, { deep: true })

// Watch for loading state
watch(() => eventStore.loading, (isLoading) => {
  console.log('Loading state changed:', isLoading)
})

// Watch for errors
watch(() => eventStore.error, (error) => {
  if (error) {
    console.error('Error fetching events:', error)
  }
})

const isSingleEvent = computed(() => eventStore.events.length === 1)
</script>

<template>
  <div class="events-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1>Available Flights</h1>
        <p class="subtitle">Choose your next adventure in the skies</p>
      </div>
      <div class="hero-background"></div>
    </div>

    <div class="content-wrapper">
      <div v-if="eventStore.loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading flights...</p>
      </div>
      
      <div v-else-if="eventStore.error" class="error">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>{{ eventStore.error }}</p>
      </div>
      
      <div v-else-if="eventStore.events.length === 0" class="no-events">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>No flights available at the moment.</p>
        <p class="subtext">Check back later for new flight opportunities.</p>
      </div>
      
      <div v-else class="events-grid" :class="{ 'single-event': isSingleEvent }">
        <EventCard
          v-for="event in eventStore.events"
          :key="event.id"
          :event="event"
        />
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

.loading, .error, .no-events {
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
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-icon, .empty-icon {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
}

.error {
  color: #dc2626;
}

.error-icon {
  color: #dc2626;
}

.subtext {
  color: #666;
  font-size: 0.9rem;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.events-grid.single-event {
  grid-template-columns: 1fr;
  max-width: 800px;
  margin: 0 auto;
}

@keyframes stars {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-200px);
  }
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
  
  .events-grid {
    grid-template-columns: 1fr;
  }
}
</style> 