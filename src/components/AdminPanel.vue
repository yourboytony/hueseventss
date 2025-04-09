<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useEventStore } from '@/stores/events'

const adminStore = useAdminStore()
const eventStore = useEventStore()

const newEvent = ref({
  title: '',
  date: '',
  time: '',
  location: '',
  description: '',
  capacity: 0
})

const isEditing = ref(false)
const editingEventId = ref('')

onMounted(() => {
  eventStore.fetchEvents()
})

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await eventStore.updateEvent(editingEventId.value, newEvent.value)
    } else {
      await eventStore.addEvent(newEvent.value)
    }
    resetForm()
  } catch (error) {
    console.error('Error saving event:', error)
  }
}

const editEvent = (event: any) => {
  isEditing.value = true
  editingEventId.value = event.id
  newEvent.value = { ...event }
}

const deleteEvent = async (id: string) => {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await eventStore.deleteEvent(id)
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }
}

const resetForm = () => {
  newEvent.value = {
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    capacity: 0
  }
  isEditing.value = false
  editingEventId.value = ''
}
</script>

<template>
  <div class="admin-panel">
    <div class="header">
      <h2>Admin Panel</h2>
      <button @click="adminStore.logout" class="logout-button">Logout</button>
    </div>

    <form @submit.prevent="handleSubmit" class="event-form">
      <h3>{{ isEditing ? 'Edit Event' : 'Add New Event' }}</h3>
      
      <div class="form-group">
        <label>Title:</label>
        <input v-model="newEvent.title" required type="text" />
      </div>

      <div class="form-group">
        <label>Date:</label>
        <input v-model="newEvent.date" required type="date" />
      </div>

      <div class="form-group">
        <label>Time:</label>
        <input v-model="newEvent.time" required type="time" />
      </div>

      <div class="form-group">
        <label>Location:</label>
        <input v-model="newEvent.location" required type="text" />
      </div>

      <div class="form-group">
        <label>Description:</label>
        <textarea v-model="newEvent.description" required></textarea>
      </div>

      <div class="form-group">
        <label>Capacity:</label>
        <input v-model="newEvent.capacity" required type="number" min="1" />
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-button">
          {{ isEditing ? 'Update Event' : 'Add Event' }}
        </button>
        <button v-if="isEditing" type="button" @click="resetForm" class="cancel-button">
          Cancel
        </button>
      </div>
    </form>

    <div class="events-list">
      <h3>Events</h3>
      <div v-if="eventStore.loading" class="loading">Loading events...</div>
      <div v-else-if="eventStore.error" class="error">{{ eventStore.error }}</div>
      <div v-else class="events-grid">
        <div v-for="event in eventStore.events" :key="event.id" class="event-card">
          <h4>{{ event.title }}</h4>
          <p><strong>Date:</strong> {{ event.date }}</p>
          <p><strong>Time:</strong> {{ event.time }}</p>
          <p><strong>Location:</strong> {{ event.location }}</p>
          <p><strong>Capacity:</strong> {{ event.capacity }}</p>
          <p class="registered-users">
            <strong>Registered:</strong> 
            {{ event.registeredUsers?.length || 0 }}/{{ event.capacity }}
          </p>
          <div class="card-actions">
            <button @click="editEvent(event)" class="edit-button">Edit</button>
            <button @click="deleteEvent(event.id)" class="delete-button">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-panel {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.event-form {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-button,
.logout-button,
.edit-button,
.delete-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.submit-button {
  background: #4169E1;
  color: white;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.logout-button {
  background: #dc3545;
  color: white;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.event-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.edit-button {
  background: #4169E1;
  color: white;
}

.delete-button {
  background: #dc3545;
  color: white;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}

@media (max-width: 768px) {
  .admin-panel {
    padding: 1rem;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }
}
</style> 