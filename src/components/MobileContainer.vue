<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  fullscreen?: boolean
}>()

const container = ref<HTMLElement | null>(null)
let touchStartY = 0
let touchStartX = 0

// Handle pull-to-refresh and swipe gestures
const handleTouchStart = (e: TouchEvent) => {
  touchStartY = e.touches[0].clientY
  touchStartX = e.touches[0].clientX
}

const handleTouchMove = (e: TouchEvent) => {
  if (!container.value) return
  
  const touchY = e.touches[0].clientY
  const touchX = e.touches[0].clientX
  const deltaY = touchY - touchStartY
  const deltaX = touchX - touchStartX
  
  // Prevent default pull-to-refresh on mobile
  if (deltaY > 0 && window.scrollY === 0) {
    e.preventDefault()
  }
  
  // Add smooth rubber-band effect at the top
  if (deltaY > 0 && window.scrollY === 0) {
    container.value.style.transform = `translateY(${Math.min(deltaY / 2, 100)}px)`
  }
}

const handleTouchEnd = () => {
  if (!container.value) return
  container.value.style.transform = ''
}

onMounted(() => {
  if (container.value) {
    container.value.addEventListener('touchstart', handleTouchStart)
    container.value.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.value.addEventListener('touchend', handleTouchEnd)
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.removeEventListener('touchstart', handleTouchStart)
    container.value.removeEventListener('touchmove', handleTouchMove)
    container.value.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<template>
  <div 
    ref="container"
    class="mobile-container"
    :class="{ 'fullscreen': fullscreen }"
  >
    <slot />
  </div>
</template>

<style scoped>
.mobile-container {
  width: 100%;
  min-height: 100vh;
  transition: transform 0.3s ease;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 50;
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .mobile-container {
    padding-bottom: env(safe-area-inset-bottom);
    padding-top: env(safe-area-inset-top);
  }
  
  /* Add smooth momentum scrolling */
  .mobile-container {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Hide scrollbars on mobile while preserving functionality */
  .mobile-container::-webkit-scrollbar {
    display: none;
  }
  
  /* Prevent text selection during swipe gestures */
  .mobile-container {
    user-select: none;
    -webkit-user-select: none;
  }
}

/* Add support for notched devices */
@supports (padding: max(0px)) {
  .mobile-container {
    padding-left: max(env(safe-area-inset-left), 1rem);
    padding-right: max(env(safe-area-inset-right), 1rem);
  }
}
</style> 