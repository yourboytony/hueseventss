<!-- PageTransition.vue -->
<script setup lang="ts">
defineProps<{
  name?: string
}>()
</script>

<template>
  <transition
    :name="name || 'page'"
    mode="out-in"
    appear
  >
    <slot />
  </transition>
</template>

<style>
/* Fade transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* Scale transition */
.scale-enter-active,
.scale-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
</style> 