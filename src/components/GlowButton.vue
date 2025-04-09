<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <button 
    class="glow-button" 
    :class="[
      `variant-${variant || 'primary'}`,
      `size-${size || 'md'}`
    ]"
  >
    <div class="button-content">
      <slot />
    </div>
    <div class="glow-effect"></div>
  </button>
</template>

<style scoped>
.glow-button {
  position: relative;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  transform: translateY(0);
}

.button-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.glow-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

/* Variants */
.variant-primary {
  background: linear-gradient(135deg, #002d65, #001529);
  color: white;
}

.variant-primary .glow-effect {
  background: radial-gradient(
    circle at center,
    rgba(163, 194, 255, 0.4) 0%,
    rgba(59, 130, 246, 0) 70%
  );
}

.variant-secondary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.variant-secondary .glow-effect {
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0) 70%
  );
}

.variant-accent {
  background: linear-gradient(135deg, #a3c2ff, #93c5fd);
  color: #1f2937;
}

.variant-accent .glow-effect {
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0) 70%
  );
}

/* Sizes */
.size-sm {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.size-md {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
}

.size-lg {
  font-size: 1.125rem;
  padding: 1rem 2rem;
}

/* Hover effects */
.glow-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.glow-button:hover .glow-effect {
  opacity: 1;
}

/* Active state */
.glow-button:active {
  transform: translateY(0);
}

/* Focus state */
.glow-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
}

/* Animation */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.glow-button:hover .button-content {
  animation: pulse 2s infinite;
}
</style> 