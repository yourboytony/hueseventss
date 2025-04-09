export interface Booking {
  eventId: string
  timeSlot: string
  firstName: string
  lastName: string
  vatsimCID: string
  email: string
  aircraftType: string
  route: string
  notes?: string
  agreementSignature: string
}

export interface Event {
  id: string
  title: string
  fromICAO: string
  toICAO: string
  aircraft: string
  flightLevel: number
  estimatedDuration: string
  registrations?: number
  maxRegistrations?: number
  timeSlots: string[]
} 