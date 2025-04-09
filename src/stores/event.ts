import { defineStore } from 'pinia'

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  endTime: string
  location: string
  price: number
  imageUrl?: string
  status: 'upcoming' | 'completed' | 'cancelled'
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

export interface Registration {
  id: string
  eventId: string
  userId: string
  createdAt: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [
      {
        id: '1',
        title: 'Summer Music Festival',
        description: 'A wonderful summer music festival featuring local artists',
        date: '2024-07-15',
        time: '14:00',
        endTime: '22:00',
        location: 'Central Park',
        price: 50,
        imageUrl: '/images/music-festival.jpg',
        status: 'upcoming',
        createdAt: '2024-01-01',
        registrations: [],
        totalSlots: 100,
        availableSlots: 100,
        slotDurationMinutes: 30,
        fromICAO: 'KJFK',
        toICAO: 'KLAX',
        aircraft: 'Boeing 737'
      },
      {
        id: '2',
        title: 'Art Exhibition',
        description: 'Contemporary art exhibition featuring international artists',
        date: '2024-08-20',
        time: '10:00',
        endTime: '18:00',
        location: 'Modern Art Gallery',
        price: 25,
        imageUrl: '/images/art-exhibition.jpg',
        status: 'upcoming',
        createdAt: '2024-01-02',
        registrations: [],
        totalSlots: 50,
        availableSlots: 50,
        slotDurationMinutes: 60,
        fromICAO: 'KBOS',
        toICAO: 'KMIA',
        aircraft: 'Airbus A320'
      },
      {
        id: '3',
        title: 'Food & Wine Tasting',
        description: 'Exclusive food and wine tasting event',
        date: '2024-09-10',
        time: '18:00',
        endTime: '22:00',
        location: 'Grand Hotel',
        price: 75,
        imageUrl: '/images/food-wine.jpg',
        status: 'upcoming',
        createdAt: '2024-01-03',
        registrations: [],
        totalSlots: 30,
        availableSlots: 30,
        slotDurationMinutes: 45,
        fromICAO: 'KSFO',
        toICAO: 'KLAS',
        aircraft: 'Boeing 787'
      }
    ] as Event[],
  }),
  getters: {
    getEventById: (state) => (id: string) => {
      return state.events.find(event => event.id === id)
    },
  },
  actions: {
    // In a real application, these would be API calls
    async fetchEvents() {
      // Simulate API call
      return this.events
    },
    async fetchEventById(id: string) {
      // Simulate API call
      return this.getEventById(id)
    },
  },
}) 