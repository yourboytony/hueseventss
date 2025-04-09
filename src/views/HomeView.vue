<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const discordLink = "https://discord.gg/3aJYnaMnbU"

const openDiscord = () => {
  window.open(discordLink, '_blank')
}

const navigateToEvents = () => {
  router.push('/events')
}
</script>

<template>
  <div class="home">
    <div class="stars"></div>
    <div class="content">
      <img src="https://i.postimg.cc/KjXScbjY/image-2025-04-09-104954765.png" alt="HUES" class="logo fade-in" />
      <h1 class="text-gradient slide-up">Event Slot Booking</h1>
      <p class="subtitle slide-up">Join our exclusive events and secure your spot</p>
      <div class="button-container">
        <router-link to="/events" class="primary-button">
          <span class="icon">📅</span>
          Book Event Slot
        </router-link>
        <a href="https://discord.gg/your-discord" target="_blank" rel="noopener" class="secondary-button">
          <span class="icon">💬</span>
          Join Discord
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: radial-gradient(ellipse at bottom, #002d65 0%, #001529 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.stars {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.3), rgba(0,0,0,0)),
              radial-gradient(2px 2px at 40px 70px, rgba(255, 255, 255, 0.3), rgba(0,0,0,0)),
              radial-gradient(2px 2px at 50px 160px, rgba(255, 255, 255, 0.3), rgba(0,0,0,0)),
              radial-gradient(2px 2px at 90px 40px, rgba(255, 255, 255, 0.3), rgba(0,0,0,0)),
              radial-gradient(2px 2px at 130px 80px, rgba(255, 255, 255, 0.3), rgba(0,0,0,0));
  background-size: 200px 200px;
  animation: stars 100s linear infinite;
  opacity: 0.5;
}

.content {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.logo {
  width: 400px;
  height: auto;
  margin-bottom: 3rem;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 0 30px rgba(255,255,255,0.15));
}

.logo:hover {
  transform: scale(1.02);
}

.text-gradient {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #a3b1ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  max-width: 600px;
  line-height: 1.6;
}

.button-container {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.primary-button, .secondary-button {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.primary-button {
  background: #4169E1;
  color: white;
  border: none;
}

.primary-button:hover {
  background: #3158d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(65, 105, 225, 0.3);
}

.secondary-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.cta-button {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.book-button {
  background: #4169E1;
  border: none;
}

.discord-button {
  background: #5865F2;
  border: none;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
}

.icon {
  width: 20px;
  height: 20px;
}

.book-button .icon {
  margin-right: 2px;
}

@keyframes stars {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-1000px);
  }
}

@media (max-width: 768px) {
  .content {
    gap: 1rem;
  }

  .button-group {
    flex-direction: column;
    width: 100%;
    padding: 0 2rem;
  }

  .cta-button {
    width: 100%;
    justify-content: center;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
    padding: 0 1rem;
  }
  
  .logo {
    max-width: 350px;
  }
}
</style> 