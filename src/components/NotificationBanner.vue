<script setup lang="ts">
defineProps<{
  message: string
  type: 'new' | 'live'
}>()
</script>

<template>
  <div class="notification-banner" :class="type">
    {{ message }}
  </div>
</template>

<style scoped>
.notification-banner {
  text-align: center;
  padding: 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  width: 100%;
  transition: all 0.3s ease;
}

.notification-banner.new {
  background-color: #1e90ff;
  color: white;
}

.notification-banner.live {
  background-color: #22c55e;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}
</style> 