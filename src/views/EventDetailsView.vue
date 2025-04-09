<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from '@/stores/events'
import type { Event } from '@/stores/events'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()

const event = ref<Event | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const isEventFull = computed(() => {
  return event.value?.availableSlots === 0
})

onMounted(async () => {
  try {
    await eventStore.fetchEvents()
    const foundEvent = eventStore.events.find(e => e.id === route.params.id)
    if (!foundEvent) {
      throw new Error('Event not found')
    }
    event.value = foundEvent
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatPrice = (price: number) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'Free'
  }
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(price)
}

const proceedToSlotSelection = () => {
  router.push({
    name: 'select-slot',
    params: { id: event.value?.id }
  })
}
</script>

<template>
  <div class="event-details min-h-screen bg-[#0a192f] text-white">
    <div v-if="event" class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div class="event-header mb-12">
        <h1 class="text-5xl font-bold mb-4">{{ event.title }}</h1>
        <p class="text-xl text-blue-200">{{ event.description }}</p>
      </div>

      <div class="event-info-grid mb-12">
        <div class="info-card">
          <h3 class="info-title">Date & Time</h3>
          <p class="info-value">{{ formatDate(event.date) }}</p>
          <p class="info-value">{{ event.time }} - {{ event.endTime }}</p>
        </div>

        <div class="info-card">
          <h3 class="info-title">Location</h3>
          <p class="info-value">{{ event.location }}</p>
        </div>

        <div class="info-card">
          <h3 class="info-title">Available Slots</h3>
          <p class="info-value">{{ event.availableSlots }} remaining</p>
        </div>

        <div class="info-card">
          <h3 class="info-title">Price</h3>
          <p class="info-value">{{ formatPrice(event.price) }}</p>
        </div>
      </div>

      <!-- Booking Button -->
      <div class="booking-actions" v-if="!isEventFull">
        <button
          @click="proceedToSlotSelection"
          class="booking-button"
        >
          Book Flight
        </button>
      </div>
      <div v-else class="text-center">
        <p class="text-xl text-red-300">This event is currently full.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div class="error-message">
        <h3 class="error-title">Error</h3>
        <p class="error-text">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-details {
  @apply min-h-screen bg-[#0a192f];
}

.event-header {
  @apply border-b border-blue-500/30 pb-8;
}

.event-info-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-6;
}

.info-card {
  @apply bg-[#112240] rounded-lg p-6 border-2 border-blue-500/30;
}

.info-title {
  @apply text-xl font-bold text-blue-200 mb-2;
}

.info-value {
  @apply text-lg text-white;
}

.booking-actions {
  @apply flex justify-center;
}

.booking-button {
  @apply px-8 py-3 rounded-lg text-lg font-medium transition-all duration-150;
  @apply bg-blue-500 text-white;
  @apply hover:bg-blue-600;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a192f];
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-blue-300 border-t-blue-100 rounded-full animate-spin;
}

.error-message {
  @apply bg-red-900/50 border-l-4 border-red-500 p-6 rounded-lg;
}

.error-title {
  @apply text-xl font-bold text-red-300 mb-2;
}

.error-text {
  @apply text-red-100;
}
</style> 