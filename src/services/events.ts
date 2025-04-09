import type { Event } from '@/types'

export const getEventById = async (id: string): Promise<Event> => {
  try {
    // TODO: Implement actual API call
    console.log('Fetching event:', id)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return mock data for now
    return {
      id,
      title: 'Frankfurt Fun',
      fromICAO: 'EDDF',
      toICAO: 'LEPA',
      aircraft: 'A320/A321/A319',
      flightLevel: 310,
      estimatedDuration: '2h 5m',
      registrations: 0,
      maxRegistrations: 20,
      timeSlots: ['06:00Z', '06:30Z', '07:00Z', '07:30Z']
    }
  } catch (error) {
    console.error('Error fetching event:', error)
    return Promise.reject(error)
  }
} 