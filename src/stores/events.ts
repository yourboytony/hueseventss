import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase/config'
import { ref as dbRef, push, set, get, remove, child, update } from 'firebase/database'

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

export const useEventStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get current notification
  const currentNotification = computed(() => {
    const now = Date.now()
    const recentEvent = events.value.find(event => {
      const eventTime = new Date(`${event.date}T${event.time}`).getTime()
      const isRecent = (now - event.createdAt) < 24 * 60 * 60 * 1000 // 24 hours
      const isLive = now >= eventTime && now <= eventTime + (2 * 60 * 60 * 1000) // 2 hour duration
      
      if (isLive) {
        return { type: 'live', event }
      }
      if (isRecent && eventTime > now) {
        return { type: 'new', event }
      }
      return false
    })

    if (!recentEvent) return null

    const eventTime = new Date(`${recentEvent.date}T${recentEvent.time}`)
    const isLive = now >= eventTime.getTime() && now <= eventTime.getTime() + (2 * 60 * 60 * 1000)

    return {
      message: isLive 
        ? `Event in Progress: ${recentEvent.title}`
        : `New Event Scheduled: ${recentEvent.title} at ${recentEvent.date.split('-').reverse().join('/')} ${recentEvent.time}Z`,
      type: isLive ? 'live' : 'new'
    }
  })

  // Fetch all events
  const fetchEvents = async () => {
    console.log('Starting to fetch events...')
    loading.value = true
    error.value = null
    try {
      const eventsRef = dbRef(db, 'events')
      console.log('Database reference created:', eventsRef)
      
      const snapshot = await get(eventsRef)
      console.log('Snapshot received:', snapshot.exists() ? 'exists' : 'does not exist')
      
      if (snapshot.exists()) {
        const eventsData = snapshot.val()
        console.log('Raw events data:', eventsData)
        
        // Convert object to array and ensure all required fields exist
        const processedEvents = Object.entries(eventsData).map(([id, data]: [string, any]) => ({
          id,
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          time: data.time || '',
          endTime: data.endTime || '',
          location: data.location || '',
          imageUrl: data.imageUrl || '',
          status: data.status || 'upcoming',
          createdAt: data.createdAt || new Date().toISOString(),
          registrations: Array.isArray(data.registrations) ? data.registrations : [],
          totalSlots: Number(data.totalSlots) || 20, // Default to 20 slots if not specified
          availableSlots: Number(data.availableSlots) || 20,
          slotDurationMinutes: Number(data.slotDurationMinutes) || 2, // Default to 2 minutes if not specified
          fromICAO: data.fromICAO || '',
          toICAO: data.toICAO || '',
          aircraft: data.aircraft || '',
          flightLevel: data.flightLevel || '',
          estimatedDuration: data.estimatedDuration || ''
        }))
        
        events.value = processedEvents
        console.log('Processed events:', events.value)
      } else {
        console.log('No events found in database')
        events.value = []
      }
    } catch (e: any) {
      console.error('Error fetching events:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
      console.log('Finished fetching events')
    }
  }

  // Add new event
  const addEvent = async (eventData: Omit<Event, 'id' | 'status' | 'createdAt' | 'registrations'>) => {
    loading.value = true
    error.value = null
    try {
      const eventsRef = dbRef(db, 'events')
      const newEventRef = push(eventsRef)
      const newEvent: Event = {
        ...eventData,
        id: newEventRef.key!,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        registrations: [],
        totalSlots: Number(eventData.totalSlots) || 20,
        availableSlots: Number(eventData.availableSlots) || 20,
        slotDurationMinutes: Number(eventData.slotDurationMinutes) || 2
      }
      await set(newEventRef, newEvent)
      await fetchEvents()
      return newEvent
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Update event status
  const updateEventStatus = async (id: string, status: Event['status']) => {
    try {
      const eventRef = dbRef(db, `events/${id}`)
      await update(eventRef, { status })
      await fetchEvents()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  // Update event
  const updateEvent = async (event: Event) => {
    loading.value = true
    error.value = null
    try {
      const eventRef = dbRef(db, `events/${event.id}`)
      await update(eventRef, event)
      await fetchEvents() // Refresh the events list
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // Delete event
  const deleteEvent = async (eventId: string) => {
    loading.value = true
    error.value = null
    try {
      const eventRef = dbRef(db, `events/${eventId}`)
      await set(eventRef, null)
      await fetchEvents()
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Helper function to generate available time slots
  const generateTimeSlots = (event: Event) => {
    const slots: string[] = []
    const startTime = new Date(`${event.date}T${event.time}`)
    const endTime = new Date(`${event.date}T${event.endTime}`)
    
    let currentSlot = new Date(startTime)
    while (currentSlot < endTime) {
      slots.push(
        currentSlot.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'UTC'
        }) + 'Z'
      )
      currentSlot.setMinutes(currentSlot.getMinutes() + event.slotDurationMinutes)
    }
    
    return slots
  }

  // Get available slots for an event
  const getAvailableSlots = (event: Event) => {
    const allSlots = generateTimeSlots(event)
    const takenSlots = event.registrations.map(reg => reg.selectedTime)
    return allSlots.filter(slot => !takenSlots.includes(slot))
  }

  // Register user for event
  const registerForEvent = async (eventId: string, registration: Omit<Registration, 'registeredAt'>) => {
    loading.value = true
    error.value = null
    try {
      const eventRef = dbRef(db, `events/${eventId}`)
      const snapshot = await get(eventRef)
      const rawEvent = snapshot.val()
      
      if (!rawEvent) {
        throw new Error('Event not found')
      }

      const event: Event = {
        ...rawEvent,
        registrations: rawEvent.registrations || [],
        availableSlots: Number(rawEvent.availableSlots)
      }
      
      // Check if the selected slot is available
      const availableSlots = getAvailableSlots(event)
      if (!availableSlots.includes(registration.selectedTime)) {
        throw new Error('Selected time slot is not available')
      }
      
      const newRegistration: Registration = {
        ...registration,
        registeredAt: new Date().toISOString()
      }
      
      const updatedEvent = {
        ...event,
        registrations: [...event.registrations, newRegistration],
        availableSlots: event.availableSlots - 1
      }
      
      await update(eventRef, updatedEvent)
      await fetchEvents()
      return newRegistration
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const getBookedSlots = (eventId: string): string[] => {
    const event = events.value.find(e => e.id === eventId)
    if (!event) return []
    return event.registrations.map(r => r.selectedTime)
  }

  return {
    events,
    loading,
    error,
    currentNotification,
    fetchEvents,
    addEvent,
    updateEventStatus,
    updateEvent,
    deleteEvent,
    registerForEvent,
    getAvailableSlots,
    getBookedSlots
  }
}) 