import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminLogin from '@/components/AdminLogin.vue'
import AdminPanelView from '../views/AdminPanelView.vue'
import { useAdminStore } from '@/stores/admin'
import EventListView from '@/views/EventListView.vue'
import EventDetailsView from '@/views/EventDetailsView.vue'
import TimeSlotSelectionView from '@/views/TimeSlotSelectionView.vue'
import BookEventView from '@/views/BookEventView.vue'
import UserGuideView from '../views/UserGuideView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/events',
      name: 'events',
      component: EventListView
    },
    {
      path: '/events/:id',
      name: 'event-details',
      component: EventDetailsView,
      props: true
    },
    {
      path: '/events/:id/slots',
      name: 'select-slot',
      component: TimeSlotSelectionView,
      props: true
    },
    {
      path: '/events/:id/book',
      name: 'book-event',
      component: BookEventView,
      props: true
    },
    {
      path: '/admin/login',
      name: 'adminLogin',
      component: AdminLogin
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPanelView,
      meta: { requiresAuth: true }
    },
    {
      path: '/guide',
      name: 'user-guide',
      component: UserGuideView
    }
  ],
})

router.beforeEach((to, _, next) => {
  const adminStore = useAdminStore()
  
  if (to.meta.requiresAuth && !adminStore.isAuthenticated) {
    next({ name: 'admin-login' })
  } else {
    next()
  }
})

export default router 