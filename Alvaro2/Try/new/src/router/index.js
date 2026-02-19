import { createRouter, createWebHistory } from 'vue-router'
import FindDrink from '../views/FindDrink.vue'
import Favorites from '../views/Favorites.vue'

const routes = [
  { path: '/', component: FindDrink },
  { path: '/favorites', component: Favorites }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
