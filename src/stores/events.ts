import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../firebase/config'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import type { Event } from './event'

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
      const eventsCollection = collection(db, 'events')
      const querySnapshot = await getDocs(eventsCollection)
      events.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch events'
    } finally {
      loading.value = false
    }
  }

  const getEventById = async (id: string): Promise<Event | null> => {
    try {
      const eventDoc = doc(db, 'events', id)
      const eventSnapshot = await getDoc(eventDoc)
      
      if (!eventSnapshot.exists()) {
        return null
      }

      return {
        id: eventSnapshot.id,
        ...eventSnapshot.data()
      } as Event
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch event'
      return null
    }
  }

  const registerForEvent = async (eventId: string, userId: string, timeSlot: string) => {
    try {
      const eventDoc = doc(db, 'events', eventId)
      const eventSnapshot = await getDoc(eventDoc)
      
      if (!eventSnapshot.exists()) {
        throw new Error('Event not found')
      }

      const event = eventSnapshot.data() as Event
      const currentSlots = event.availableSlots ?? event.totalSlots

      if (currentSlots <= 0) {
        throw new Error('No available slots')
      }

      await updateDoc(eventDoc, {
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