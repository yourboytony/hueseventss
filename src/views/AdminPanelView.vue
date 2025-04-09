<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useBannedUsersStore } from '@/stores/bannedUsers'
import type { Event } from '@/stores/events'

const eventStore = useEventsStore()
const bannedUsersStore = useBannedUsersStore()
const activeTab = ref('slots')
const isCreatingBan = ref(false)

const selectedEvent = ref<Event | null>(null)
const isEditingEvent = ref(false)
const isCreatingEvent = ref(false)

const newEvent = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  endTime: '',
  fromICAO: '',
  toICAO: '',
  aircraft: '',
  flightLevel: '',
  estimatedDuration: '',
  location: '',
  totalSlots: 0,
  availableSlots: 0,
  slotDurationMinutes: 30,
  imageUrl: '',
  registrations: []
})

const formattedEmails = computed(() => {
  if (!selectedEvent.value) return ''
  return selectedEvent.value.registrations
    ?.map(reg => reg.email)
    .join(', ') || 'No registrations yet'
})

const copyEmails = async () => {
  try {
    await navigator.clipboard.writeText(formattedEmails.value)
    alert('Emails copied to clipboard!')
  } catch (err) {
    alert('Failed to copy emails. Please copy manually.')
  }
}

const handleEditEvent = (event: Event) => {
  selectedEvent.value = { ...event }
  isEditingEvent.value = true
}

const saveEventChanges = () => {
  if (selectedEvent.value) {
    eventStore.updateEvent(selectedEvent.value)
    isEditingEvent.value = false
    selectedEvent.value = null
  }
}

const createEvent = async () => {
  try {
    await eventStore.addEvent(newEvent.value)
    isCreatingEvent.value = false
    // Reset form
    newEvent.value = {
      title: '',
      description: '',
      date: '',
      time: '',
      endTime: '',
      fromICAO: '',
      toICAO: '',
      aircraft: '',
      flightLevel: '',
      estimatedDuration: '',
      location: '',
      totalSlots: 0,
      availableSlots: 0,
      slotDurationMinutes: 30,
      imageUrl: '',
      registrations: []
    }
  } catch (error) {
    alert('Failed to create event. Please try again.')
  }
}

const deleteEvent = async (event: Event) => {
  if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
    try {
      await eventStore.deleteEvent(event.id)
    } catch (error) {
      alert('Failed to delete event. Please try again.')
    }
  }
}

// Add loading state
const isLoading = ref(true)

// Add new banned user form data
const newBanForm = ref({
  vatsimCID: '',
  name: '',
  email: '',
  reason: '',
  bannedUntil: ''
})

// Load events on mount
onMounted(async () => {
  try {
    isLoading.value = true
    await eventStore.fetchEvents()
  } catch (error) {
    console.error('Failed to load events:', error)
  } finally {
    isLoading.value = false
  }
})

const handleBanUser = async () => {
  try {
    await bannedUsersStore.banUser({
      vatsimCID: newBanForm.value.vatsimCID,
      name: newBanForm.value.name,
      email: newBanForm.value.email,
      reason: newBanForm.value.reason,
      bannedUntil: newBanForm.value.bannedUntil || undefined
    })
    // Reset form
    newBanForm.value = {
      vatsimCID: '',
      name: '',
      email: '',
      reason: '',
      bannedUntil: ''
    }
  } catch (error) {
    alert('Failed to ban user. Please try again.')
  }
}

const handleUnbanUser = async (userId: string) => {
  if (confirm('Are you sure you want to unban this user?')) {
    try {
      await bannedUsersStore.unbanUser(userId)
    } catch (error) {
      alert('Failed to unban user. Please try again.')
    }
  }
}

// Add helper function for time formatting
const formatZuluTime = (timeStr: string) => {
  return timeStr + 'Z'
}

// Add helper function for date formatting
const formatEventDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Add to script setup section at the top
const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: `<path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>`,
    content: [
      {
        title: 'Welcome to Flight Booking',
        text: 'Our platform provides a seamless experience for booking virtual flight slots. Whether you\'re a pilot or enthusiast, this guide will help you make the most of our features.'
      },
      {
        title: 'Key Features',
        list: [
          'Real-time slot availability',
          'UTC/Zulu time support',
          'Detailed flight information',
          'Easy booking process',
          'Route visualization'
        ]
      }
    ]
  },
  {
    id: 'booking-process',
    title: 'Booking Process',
    icon: `<path d="M8 7V3m8 4V3M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>`,
    content: [
      {
        title: 'Step 1: Browse Available Flights',
        text: 'From the main page, you\'ll see all upcoming flights. Each card shows key information including route, aircraft, and available slots.'
      },
      {
        title: 'Step 2: Select a Time Slot',
        text: 'After selecting a flight, you\'ll see available time slots. Times can be viewed in both local and Zulu (UTC) format for convenience.'
      },
      {
        title: 'Step 3: Complete Registration',
        text: 'Fill in your details and confirm your booking. You\'ll receive confirmation and can manage your bookings from your profile.'
      }
    ]
  },
  {
    id: 'time-management',
    title: 'Time Management',
    icon: `<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    content: [
      {
        title: 'Understanding Time Zones',
        text: 'All flights are scheduled in Zulu (UTC) time to avoid confusion across different time zones. You can toggle between local and Zulu time display.'
      },
      {
        title: 'Slot Duration',
        text: 'Each slot is precisely timed to ensure smooth operations. The duration is shown in the flight details and considers route complexity.'
      }
    ]
  },
  {
    id: 'flight-information',
    title: 'Flight Information',
    icon: `<path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>`,
    content: [
      {
        title: 'Route Details',
        text: 'Each flight shows departure (FROM) and arrival (TO) airports using ICAO codes. The estimated duration and flight level are also displayed.'
      },
      {
        title: 'Aircraft Information',
        text: 'Aircraft types are listed for each flight. This helps you prepare for the specific characteristics of your chosen aircraft.'
      }
    ]
  },
  {
    id: 'managing-bookings',
    title: 'Managing Bookings',
    icon: `<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>`,
    content: [
      {
        title: 'View Your Bookings',
        text: 'Access your upcoming and past flights from your profile. Each booking shows complete flight details and status.'
      },
      {
        title: 'Cancellation Policy',
        text: 'Bookings can be cancelled up to 24 hours before the scheduled time. The slot will be automatically released for others.'
      }
    ]
  }
]

const activeGuideSection = ref('getting-started')

const activeSection = computed(() => {
  return sections.find(section => section.id === activeGuideSection.value)
})
</script>

<template>
  <div class="admin-panel">
    <div class="admin-tabs">
      <button 
        :class="['tab-button', { active: activeTab === 'slots' }]"
        @click="activeTab = 'slots'"
      >
        Flight Management
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'emails' }]"
        @click="activeTab = 'emails'"
      >
        Email Lists
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'bans' }]"
        @click="activeTab = 'bans'"
      >
        Banned Users
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'guide' }]"
        @click="activeTab = 'guide'"
      >
        User Guide
      </button>
    </div>

    <div class="tab-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading data...</p>
      </div>

      <!-- Flight Management Tab -->
      <div v-else-if="activeTab === 'slots'" class="slots-tab">
        <div class="tab-header">
          <h2>Flight Events</h2>
          <button class="create-button" @click="isCreatingEvent = true">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Flight Event
          </button>
        </div>
        
        <div class="events-grid">
          <div v-for="event in eventStore.events" :key="event.id" class="event-card">
            <div class="event-header">
              <h3>{{ event.title }}</h3>
              <div class="route-info">
                {{ event.fromICAO }} → {{ event.toICAO }}
              </div>
              <div class="event-actions">
                <button class="edit-button" @click="handleEditEvent(event)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button class="delete-button" @click="deleteEvent(event)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
            <div class="event-details">
              <p><strong>Date:</strong> {{ formatEventDate(event.date) }}</p>
              <p><strong>Time:</strong> {{ formatZuluTime(event.time) }}</p>
              <p><strong>End Time:</strong> {{ formatZuluTime(event.endTime) }}</p>
              <p><strong>Aircraft:</strong> {{ event.aircraft }}</p>
              <p><strong>Flight Level:</strong> {{ event.flightLevel }}</p>
              <p><strong>Est. Duration:</strong> {{ event.estimatedDuration }}</p>
              <p><strong>Available Slots:</strong> {{ event.availableSlots }}</p>
              <p><strong>Registrations:</strong> {{ event.registrations?.length || 0 }}</p>
              <p><strong>Status:</strong> <span class="status-badge" :class="event.status">{{ event.status }}</span></p>
            </div>
          </div>
        </div>

        <!-- Create Event Modal -->
        <div v-if="isCreatingEvent" class="modal">
          <div class="modal-content">
            <h3>Create New Flight Event</h3>
            <div class="form-group">
              <label>Title</label>
              <input v-model="newEvent.title" type="text" placeholder="Event title">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="newEvent.description" placeholder="Event description" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>From (ICAO)</label>
                <input v-model="newEvent.fromICAO" type="text" placeholder="EDDF" maxlength="4">
              </div>
              <div class="form-group">
                <label>To (ICAO)</label>
                <input v-model="newEvent.toICAO" type="text" placeholder="KJFK" maxlength="4">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date</label>
                <input v-model="newEvent.date" type="date">
              </div>
              <div class="form-group">
                <label>Time (Zulu)</label>
                <input v-model="newEvent.time" type="time">
                <span class="help-text">All times in Zulu (UTC)</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>End Time (Zulu)</label>
                <input v-model="newEvent.endTime" type="time">
                <span class="help-text">All times in Zulu (UTC)</span>
              </div>
              <div class="form-group">
                <label>Aircraft</label>
                <input v-model="newEvent.aircraft" type="text" placeholder="B738">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Flight Level</label>
                <input v-model="newEvent.flightLevel" type="text" placeholder="FL360">
              </div>
            </div>
            <div class="form-group">
              <label>Estimated Duration</label>
              <input v-model="newEvent.estimatedDuration" type="text" placeholder="2h 30m">
            </div>
            <div class="form-group">
              <label>Available Slots</label>
              <input v-model.number="newEvent.availableSlots" type="number" min="1">
            </div>
            <div class="form-group">
              <label>Image URL (optional)</label>
              <input v-model="newEvent.imageUrl" type="url" placeholder="https://...">
            </div>
            <div class="modal-actions">
              <button class="cancel-button" @click="isCreatingEvent = false">Cancel</button>
              <button class="save-button" @click="createEvent">Create Event</button>
            </div>
          </div>
        </div>

        <!-- Edit Event Modal -->
        <div v-if="isEditingEvent && selectedEvent" class="modal">
          <div class="modal-content">
            <h3>Edit Flight Event</h3>
            <div class="form-group">
              <label>Title</label>
              <input v-model="selectedEvent.title" type="text">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="selectedEvent.description" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>From (ICAO)</label>
                <input v-model="selectedEvent.fromICAO" type="text" maxlength="4">
              </div>
              <div class="form-group">
                <label>To (ICAO)</label>
                <input v-model="selectedEvent.toICAO" type="text" maxlength="4">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date</label>
                <input v-model="selectedEvent.date" type="date">
              </div>
              <div class="form-group">
                <label>Time (Zulu)</label>
                <input v-model="selectedEvent.time" type="time">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>End Time (Zulu)</label>
                <input v-model="selectedEvent.endTime" type="time">
              </div>
              <div class="form-group">
                <label>Aircraft</label>
                <input v-model="selectedEvent.aircraft" type="text">
              </div>
            </div>
            <div class="form-group">
              <label>Flight Level</label>
              <input v-model="selectedEvent.flightLevel" type="text">
            </div>
            <div class="form-group">
              <label>Estimated Duration</label>
              <input v-model="selectedEvent.estimatedDuration" type="text">
            </div>
            <div class="form-group">
              <label>Available Slots</label>
              <input v-model.number="selectedEvent.availableSlots" type="number" min="0">
            </div>
            <div class="form-group">
              <label>Image URL</label>
              <input v-model="selectedEvent.imageUrl" type="url">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="selectedEvent.status">
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="past">Past</option>
              </select>
            </div>
            <div class="modal-actions">
              <button class="cancel-button" @click="isEditingEvent = false">Cancel</button>
              <button class="save-button" @click="saveEventChanges">Save Changes</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Lists Tab -->
      <div v-else-if="activeTab === 'emails'" class="emails-tab">
        <h2>Email Lists</h2>
        <div class="email-list-container">
          <div class="event-selector">
            <label>Select Event:</label>
            <select v-model="selectedEvent">
              <option :value="null">Choose an event...</option>
              <option v-for="event in eventStore.events" :key="event.id" :value="event">
                {{ event.title }} ({{ new Date(event.date).toLocaleDateString() }})
              </option>
            </select>
          </div>

          <div v-if="selectedEvent" class="email-display">
            <h3>{{ selectedEvent.title }} - Registered Emails</h3>
            <div class="email-list">
              <p>{{ formattedEmails }}</p>
            </div>
            <button class="copy-button" @click="copyEmails">
              Copy Emails
            </button>
          </div>
        </div>
      </div>

      <!-- Banned Users Tab -->
      <div v-else-if="activeTab === 'bans'" class="bans-tab">
        <div class="tab-header">
          <h2>Banned Users</h2>
          <button class="create-button" @click="isCreatingBan = true">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ban New User
          </button>
        </div>

        <!-- Banned Users List -->
        <div class="banned-users-grid">
          <div v-for="user in bannedUsersStore.bannedUsers" :key="user.id" class="banned-user-card">
            <div class="banned-user-header">
              <h3>{{ user.name }}</h3>
              <span class="vatsim-cid">CID: {{ user.vatsimCID }}</span>
            </div>
            <div class="banned-user-details">
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Reason:</strong> {{ user.reason }}</p>
              <p><strong>Banned At:</strong> {{ new Date(user.bannedAt).toLocaleString() }}</p>
              <p v-if="user.bannedUntil">
                <strong>Banned Until:</strong> {{ new Date(user.bannedUntil).toLocaleString() }}
              </p>
              <p v-else class="permanent-ban">Permanent Ban</p>
            </div>
            <div class="banned-user-actions">
              <button class="unban-button" @click="handleUnbanUser(user.id)">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Unban User
              </button>
            </div>
          </div>
        </div>

        <!-- Ban User Modal -->
        <div v-if="isCreatingBan" class="modal">
          <div class="modal-content">
            <h3>Ban User</h3>
            <div class="form-group">
              <label>VATSIM CID</label>
              <input v-model="newBanForm.vatsimCID" type="text" placeholder="Enter VATSIM CID">
            </div>
            <div class="form-group">
              <label>Name</label>
              <input v-model="newBanForm.name" type="text" placeholder="Enter user's name">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="newBanForm.email" type="email" placeholder="Enter user's email">
            </div>
            <div class="form-group">
              <label>Reason</label>
              <textarea v-model="newBanForm.reason" placeholder="Enter reason for ban" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Ban Duration (Optional)</label>
              <input v-model="newBanForm.bannedUntil" type="datetime-local">
              <span class="help-text">Leave empty for permanent ban</span>
            </div>
            <div class="modal-actions">
              <button class="cancel-button" @click="isCreatingBan = false">Cancel</button>
              <button class="submit-button" @click="handleBanUser">Ban User</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add new guide tab content -->
      <div v-else-if="activeTab === 'guide'" class="guide-section">
        <div class="guide-container">
          <!-- Navigation Sidebar -->
          <nav class="guide-nav">
            <button
              v-for="section in sections"
              :key="section.id"
              class="nav-item"
              :class="{ active: activeGuideSection === section.id }"
              @click="activeGuideSection = section.id"
            >
              <svg 
                class="nav-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  v-html="section.icon"
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                />
              </svg>
              {{ section.title }}
            </button>
          </nav>

          <!-- Content Area -->
          <div class="guide-content">
            <transition name="fade" mode="out-in">
              <div class="section-content" :key="activeGuideSection">
                <template v-if="activeSection">
                  <h2>{{ activeSection.title }}</h2>
                  
                  <div 
                    v-for="(item, index) in activeSection.content"
                    :key="index"
                    class="content-block"
                  >
                    <h3>{{ item.title }}</h3>
                    <p v-if="item.text">{{ item.text }}</p>
                    <ul v-if="item.list">
                      <li v-for="(listItem, listIndex) in item.list" :key="listIndex">
                        {{ listItem }}
                      </li>
                    </ul>
                  </div>
                </template>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Documentation Footer -->
    <footer class="admin-footer">
      <div class="docs-content">
        <h4>Quick Guide</h4>
        <div class="docs-sections">
          <div class="docs-section">
            <h5>Flight Management</h5>
            <ul>
              <li>Click "Create Flight Event" to add a new flight</li>
              <li>Enter ICAO codes in uppercase (e.g., EDDF)</li>
              <li>Time should be in Zulu/UTC format</li>
              <li>Flight Level format: FL360, FL380, etc.</li>
            </ul>
          </div>
          <div class="docs-section">
            <h5>Email Lists</h5>
            <ul>
              <li>Select a flight from the dropdown</li>
              <li>View all registered participant emails</li>
              <li>Click "Copy Emails" to copy the list</li>
              <li>Paste directly into Gmail's "To" field</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.admin-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.admin-tabs {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.tab-button.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.tab-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.create-button:hover {
  background: rgba(34, 197, 94, 0.3);
  transform: translateY(-1px);
}

.create-button:active {
  transform: translateY(0);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.event-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.event-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.event-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.edit-button, .delete-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.edit-button {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: white;
}

.edit-button:hover {
  background: rgba(59, 130, 246, 0.3);
}

.delete-button {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: white;
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.3);
}

.event-details p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.live {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(34, 197, 94);
}

.status-badge.upcoming {
  background: rgba(59, 130, 246, 0.2);
  color: rgb(59, 130, 246);
}

.status-badge.past {
  background: rgba(100, 116, 139, 0.2);
  color: rgb(148, 163, 184);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #002d65;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button, .save-button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.cancel-button {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: white;
}

.cancel-button:hover {
  background: rgba(239, 68, 68, 0.3);
}

.save-button {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: white;
}

.save-button:hover {
  background: rgba(34, 197, 94, 0.3);
}

.email-list-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.event-selector {
  margin-bottom: 1.5rem;
}

.event-selector select {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
}

.email-list {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.25rem;
  padding: 1rem;
  margin: 1rem 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.copy-button {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-button:hover {
  background: rgba(59, 130, 246, 0.3);
}

.admin-footer {
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
}

.docs-content h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.docs-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.docs-section h5 {
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.9);
}

.docs-section ul {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.docs-section li {
  margin: 0.25rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.route-info {
  font-family: monospace;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #6b7280;
}

.banned-users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.banned-user-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.banned-user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.banned-user-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.banned-user-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.vatsim-cid {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: #4b5563;
}

.banned-user-details {
  margin-bottom: 1rem;
}

.banned-user-details p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.permanent-ban {
  color: #dc2626;
  font-weight: 500;
}

.banned-user-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.unban-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  color: #1f2937;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.unban-button:hover {
  background: #e5e7eb;
}

.unban-button .icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.help-text {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.time-zulu {
  font-family: monospace;
  font-weight: 500;
}

/* Responsive styles */
@media (max-width: 768px) {
  .banned-users-grid {
    grid-template-columns: 1fr;
  }
}

.guide-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
  margin-top: 2rem;
}

.guide-nav {
  background: #f8faff;
  padding: 1.5rem;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: #4b5563;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: #f1f5ff;
  color: #3b82f6;
}

.nav-item.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.guide-content {
  padding: 2rem;
  overflow-y: auto;
}

.section-content {
  max-width: 700px;
}

.content-block {
  margin-bottom: 2rem;
  animation: slideUp 0.5s ease-out;
}

.content-block h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.content-block p {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.content-block ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.content-block li {
  color: #4b5563;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.content-block li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 1rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #3b82f6;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

@media (max-width: 768px) {
  .guide-container {
    grid-template-columns: 1fr;
  }

  .guide-nav {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem;
  }

  .nav-item {
    padding: 0.5rem 0.75rem;
  }

  .guide-content {
    padding: 1.5rem;
  }
}
</style> 