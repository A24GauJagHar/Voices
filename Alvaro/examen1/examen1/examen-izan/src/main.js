import { createApp } from 'vue'
import App from './App.vue'

// 1. Importar Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// 2. Importar Router y tu componente
import { createRouter, createWebHistory } from 'vue-router'
import Cerca from './Cerca.vue'

// CONFIGURACIÓN ROUTER (Sin carpeta router)
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Cerca } // Ruta única
  ]
})

// CONFIGURACIÓN VUETIFY
const vuetify = createVuetify({
  components,
  directives,
})

// CREAR APP
createApp(App)
  .use(vuetify)
  .use(router) // Importante usar el router
  .mount('#app')