import { createRouter, createWebHistory } from 'vue-router'
import ActivityView from '../views/ActivityView.vue'
import AdminPanel from '../views/AdminPanel.vue'
import FriendsView from '../views/FriendsView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ActivityView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPanel,
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
  ],
})

export default router
