<script setup lang="ts">
defineProps<{
  variant?: 'stars' | 'grid' | 'waves'
}>()
</script>

<template>
  <div class="animated-background">
    <div class="gradient-overlay"></div>
    <div class="particles"></div>
    <div class="grid-lines"></div>
    <div class="shooting-stars"></div>
  </div>
</template>

<style scoped>
.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(0, 45, 101, 0.95) 0%,
    rgba(0, 21, 41, 0.95) 100%
  );
  z-index: 1;
}

.particles {
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
    radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.3), rgba(0,0,0,0)),
    radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.3), rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: particles 8s linear infinite;
  opacity: 0.6;
  z-index: 2;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(163, 194, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(163, 194, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid 15s linear infinite;
  z-index: 3;
}

.shooting-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
}

.shooting-stars::before,
.shooting-stars::after {
  content: "";
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 4px 2px rgba(255, 255, 255, 0.4);
  animation: shoot 3s infinite;
  opacity: 0;
}

.shooting-stars::after {
  animation-delay: 1.5s;
}

@keyframes particles {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-200px);
  }
}

@keyframes grid {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(50px);
  }
}

@keyframes shoot {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  1% {
    opacity: 1;
  }
  10% {
    transform: translate(120vw, -100vh);
  }
  20%, 100% {
    opacity: 0;
  }
}

/* Variant specific styles */
:deep(.stars) .particles {
  animation: particles 12s linear infinite;
}

:deep(.grid) .grid-lines {
  background-size: 30px 30px;
  animation: grid 10s linear infinite;
}

:deep(.waves) .gradient-overlay {
  background: linear-gradient(135deg,
    rgba(0, 45, 101, 0.9) 0%,
    rgba(0, 21, 41, 0.95) 100%
  );
  animation: wave 8s ease-in-out infinite alternate;
}

@keyframes wave {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-20px);
  }
}
</style> 