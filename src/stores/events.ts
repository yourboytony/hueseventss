import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase/config'
import { ref as dbRef, get, update } from 'firebase/database'

export interface Registration {
  name: string
  vatsimCid: string
  email: string
  aircraftType: string
  route: string
  notes?: string
  registeredAt: string
  selectedTime: string // Time in Zulu format
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string  // Start time
  endTime: string  // End time
  location: string
  imageUrl: string
  status: string
  createdAt: string
  registrations: Registration[]
  totalSlots: number
  availableSlots: number
  slotDurationMinutes: number
  fromICAO: string
  toICAO: string
  aircraft: string
  flightLevel?: string
  estimatedDuration?: string
}

export const useEventsStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchEvents = async () => {
    try {
      loading.value = true
      error.value = null
      const eventsRef = dbRef(db, 'events')
      const snapshot = await get(eventsRef)
      
      if (snapshot.exists()) {
        const eventsData = snapshot.val()
        events.value = Object.entries(eventsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as Event[]
      } else {
        events.value = []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch events'
    } finally {
      loading.value = false
    }
  }

  const getEventById = async (id: string): Promise<Event | null> => {
    try {
      const eventRef = dbRef(db, `events/${id}`)
      const snapshot = await get(eventRef)
      
      if (!snapshot.exists()) {
        return null
      }

      return {
        id,
        ...snapshot.val()
      } as Event
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch event'
      return null
    }
  }

  const registerForEvent = async (eventId: string, userId: string, timeSlot: string) => {
    try {
      const eventRef = dbRef(db, `events/${eventId}`)
      const snapshot = await get(eventRef)
      
      if (!snapshot.exists()) {
        throw new Error('Event not found')
      }

      const event = snapshot.val() as Event
      const currentSlots = event.availableSlots ?? event.totalSlots

      if (currentSlots <= 0) {
        throw new Error('No available slots')
      }

      await update(eventRef, {
        registrations: [...(event.registrations || []), { userId, timeSlot, status: 'pending' }],
        availableSlots: (currentSlots - 1)
      })

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to register for event'
      return false
    }
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    getEventById,
    registerForEvent
  }
}) 