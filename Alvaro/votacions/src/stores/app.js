import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import WebSocketService from '@/services/WebSocketService'

export const useAppStore = defineStore('app', () => {
  // State
  const loginInfo = ref({
    loggedIn: false,
    username: '',
    image: '',
  })
  const votos = ref([0, 0, 0, 0]) // Array para 4 opciones
  
  // Instancia única de WebSocket
  const wsService = new WebSocketService('ws://localhost:3999')

  // Getters (como computed properties)
  const isLoggedIn = computed(() => loginInfo.value.loggedIn)

  // Actions (como funciones)
  function setLoginInfo({ loggedIn, username, image }) {
    loginInfo.value = { loggedIn, username, image }
  }

  function setVotos(nousVots) {
    // Si recibimos un objeto del servidor, lo convertimos a array
    if (typeof nousVots === 'object' && !Array.isArray(nousVots)) {
      votos.value = [
        nousVots['0'] || 0,
        nousVots['1'] || 0,
        nousVots['2'] || 0,
        nousVots['3'] || 0
      ]
    } else {
      votos.value = nousVots
    }
  }

  function sendVote(index) {
    wsService.sendVote(index)
  }

  function connectWebSocket() {
    wsService.connect()
  }

  function disconnectWebSocket() {
    wsService.disconnect()
  }

  return { 
    loginInfo, 
    votos, 
    isLoggedIn, 
    setLoginInfo, 
    setVotos,
    sendVote,
    connectWebSocket,
    disconnectWebSocket
  }
})