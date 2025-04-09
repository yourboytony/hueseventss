<!-- LoadingScreen.vue -->
<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="loading-screen">
    <div class="loading-content">
      <div class="logo-container">
        <div class="logo">HUES</div>
        <div class="by-horizon">BY HORIZON</div>
      </div>
      <div class="loading-bar">
        <div class="loading-progress"></div>
      </div>
      <div class="loading-message">{{ message || 'Loading...' }}</div>
    </div>
  </div>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #002d65 0%, #001529 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), rgba(0,0,0,0)),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.3), rgba(0,0,0,0)),
    radial-gradient(2px 2px at 50px 160px, rgba(255,255,255,0.3), rgba(0,0,0,0)),
    radial-gradient(2px 2px at 90px 40px, rgba(255,255,255,0.3), rgba(0,0,0,0)),
    radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.3), rgba(0,0,0,0));
  background-size: 200px 200px;
  animation: stars 8s linear infinite;
}

.loading-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.logo-container {
  text-align: center;
}

.logo {
  font-size: 4rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5rem;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

.by-horizon {
  font-size: 1rem;
  color: #a3c2ff;
  letter-spacing: 0.25rem;
  margin-top: 0.5rem;
  opacity: 0;
  animation: fadeIn 0.5s ease-out 0.5s forwards;
}

.loading-bar {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.loading-progress {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #a3c2ff);
  animation: progress 2s ease-in-out infinite;
  transform-origin: left;
}

.loading-message {
  color: white;
  font-size: 1rem;
  opacity: 0.8;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes glow {
  from {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }
  to {
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.8),
                 0 0 40px rgba(163, 194, 255, 0.6);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progress {
  0% {
    transform: scaleX(0);
  }
  50% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
    transform-origin: right;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes stars {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-200px);
  }
}
</style> 