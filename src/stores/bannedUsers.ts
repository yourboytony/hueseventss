import { defineStore } from 'pinia'

interface BannedUser {
  id: string
  vatsimCID: string
  name: string
  email: string
  reason: string
  bannedAt: string
  bannedUntil?: string
}

export const useBannedUsersStore = defineStore('bannedUsers', {
  state: () => ({
    bannedUsers: [] as BannedUser[]
  }),

  actions: {
    async banUser(user: Omit<BannedUser, 'id' | 'bannedAt'>) {
      const newBannedUser: BannedUser = {
        id: crypto.randomUUID(),
        ...user,
        bannedAt: new Date().toISOString()
      }
      this.bannedUsers.push(newBannedUser)
      // In a real app, you would save this to a backend
      return newBannedUser
    },

    async unbanUser(userId: string) {
      const index = this.bannedUsers.findIndex(user => user.id === userId)
      if (index !== -1) {
        this.bannedUsers.splice(index, 1)
        // In a real app, you would update this in the backend
      }
    },

    isUserBanned(vatsimCID: string): boolean {
      return this.bannedUsers.some(user => {
        if (user.vatsimCID === vatsimCID) {
          if (user.bannedUntil) {
            return new Date(user.bannedUntil) > new Date()
          }
          return true // Permanent ban
        }
        return false
      })
    }
  }
}) 