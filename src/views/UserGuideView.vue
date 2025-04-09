<script setup lang="ts">
import { ref, computed } from 'vue'
import PageTransition from '@/components/PageTransition.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'

const activeSection = ref('getting-started')

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

const currentSection = computed(() => {
  return sections.find(section => section.id === activeSection.value)
})
</script>

<template>
  <PageTransition name="scale">
    <div class="guide-page">
      <div class="hero-section">
        <AnimatedBackground variant="stars" />
        <div class="hero-content">
          <h1>User Guide</h1>
          <p class="subtitle">Master every feature of our flight booking platform</p>
        </div>
      </div>

      <div class="content-wrapper">
        <div class="guide-container">
          <!-- Navigation Sidebar -->
          <nav class="guide-nav">
            <button
              v-for="section in sections"
              :key="section.id"
              class="nav-item"
              :class="{ active: activeSection === section.id }"
              @click="activeSection = section.id"
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
              <div class="section-content" :key="activeSection">
                <template v-if="currentSection">
                  <h2>{{ currentSection.title }}</h2>
                  
                  <div 
                    v-for="(item, index) in currentSection.content"
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
  </PageTransition>
</template>

<style scoped>
.guide-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.hero-section {
  position: relative;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  overflow: hidden;
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

.guide-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
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

h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.content-block {
  margin-bottom: 2rem;
  animation: slideUp 0.5s ease-out;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

p {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 1rem;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  color: #4b5563;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

li::before {
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

/* Responsive Design */
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

  h1 {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .content-wrapper {
    padding: 0 1rem 2rem;
  }
}
</style> 