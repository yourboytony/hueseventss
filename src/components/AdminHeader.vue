<script setup lang="ts">
import { useAdminStore } from '@/stores/admin'
import { useEventStore } from '@/stores/events'

const adminStore = useAdminStore()
const eventStore = useEventStore()

const handleLogout = () => {
  adminStore.logout()
}
</script>

<template>
  <div class="admin-header">
    <div class="header-content">
      <div class="admin-status">
        <div class="status-indicator" :class="{ 'is-admin': adminStore.isAuthenticated }">
          <span class="status-dot"></span>
          <span class="status-text">{{ adminStore.isAuthenticated ? 'Admin Mode' : 'Viewer Mode' }}</span>
        </div>
        <span v-if="adminStore.isAuthenticated" class="admin-email">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ adminStore.email }}
        </span>
      </div>
      <div class="admin-controls">
        <template v-if="adminStore.isAuthenticated">
          <button class="admin-button manage">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Manage Events
          </button>
          <button class="admin-button logout" @click="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </template>
        <template v-else>
          <button class="admin-button login" @click="$router.push('/admin/login')">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Admin Login
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 20, 40, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-status {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(100, 116, 139, 0.2);
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(100, 116, 139, 0.3);
  transition: all 0.2s ease;
}

.status-indicator.is-admin {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.3);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
  position: relative;
}

.status-indicator.is-admin .status-dot {
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
}

.status-dot::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-indicator.is-admin .status-dot::after {
  border: 1px solid rgba(34, 197, 94, 0.5);
}

.status-indicator:not(.is-admin) .status-dot::after {
  border: 1px solid rgba(100, 116, 139, 0.5);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(2); opacity: 0; }
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.admin-email {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-controls {
  display: flex;
  gap: 0.75rem;
}

.admin-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.admin-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.admin-button:active {
  transform: translateY(0);
}

.admin-button.manage {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.admin-button.manage:hover {
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.4);
}

.admin-button.logout {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}

.admin-button.logout:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.4);
}

.admin-button.login {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.admin-button.login:hover {
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.4);
}
</style> 