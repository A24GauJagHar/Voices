// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/PortadaInicial.vue'),
  },
  {
    path: '/helloworld',
    name: 'HelloWorld',
    component: () => import('@/components/visorModul.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router