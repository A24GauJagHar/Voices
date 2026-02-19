<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
    <h1 class="text-2xl font-bold mb-6">Juego: Piedra, Papel o Tijeras</h1>
    
    <!-- Información de la sala -->
    <div v-if="currentRoom" class="bg-white shadow-lg rounded-xl p-4 mb-6 w-full max-w-md">
      <h2 class="text-lg font-semibold mb-2">Sala: {{ currentRoom }}</h2>
      <p class="text-sm text-gray-600">Jugador: {{ currentUsername }}</p>
      
      <div v-if="players.length > 0" class="mt-3">
        <h3 class="font-medium mb-2">Jugadores:</h3>
        <div class="flex justify-around">
          <div v-for="player in players" :key="player.username" class="text-sm">
            <span :class="player.ready ? 'text-green-600 font-bold' : ''">
              {{ player.username }}
            </span>
            <span v-if="player.ready" class="ml-1">✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de estado -->
    <div v-if="mensaje" class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 max-w-md">
      {{ mensaje }}
    </div>

    <!-- Esperando oponente -->
    <div v-if="waitingForOpponent" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 max-w-md">
      <p class="font-semibold">Esperando a otro jugador...</p>
      <div class="mt-2">
        <div class="animate-pulse flex justify-center">
          <div class="h-2 w-2 bg-yellow-600 rounded-full mx-1"></div>
          <div class="h-2 w-2 bg-yellow-600 rounded-full mx-1"></div>
          <div class="h-2 w-2 bg-yellow-600 rounded-full mx-1"></div>
        </div>
      </div>
    </div>

    <!-- Botones de selección -->
    <div v-if="currentRoom && !waitingForOpponent && !gameResult" class="bg-white shadow-lg rounded-xl p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">Haz tu elección:</h3>
      <div class="flex gap-4 mb-6">
        <v-col cols="auto">
          <v-btn 
            @click="seleccionar('Piedra')"
            density="comfortable"
            :disabled="eleccionHecha"
            :color="eleccion === 'Piedra' ? 'primary' : ''"
          >
            🪨 Piedra
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn 
            @click="seleccionar('Papel')"
            density="comfortable"
            :disabled="eleccionHecha"
            :color="eleccion === 'Papel' ? 'primary' : ''"
          >
            📄 Papel
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn 
            @click="seleccionar('Tijeras')"
            density="comfortable"
            :disabled="eleccionHecha"
            :color="eleccion === 'Tijeras' ? 'primary' : ''"
          >
            ✂️ Tijeras
          </v-btn>
        </v-col>
      </div>
      
      <div v-if="eleccion" class="text-xl">
        Tu elección: <span class="font-semibold">{{ eleccion }}</span>
        <p v-if="eleccionHecha" class="text-sm text-gray-600 mt-2">
          Esperando la elección del oponente...
        </p>
      </div>
    </div>

    <!-- Modo solitario (sin sala) -->
    <div v-if="!currentRoom" class="bg-white shadow-lg rounded-xl p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">Modo Solitario - Contra la máquina</h3>
      <div class="flex gap-4 mb-6">
        <v-col cols="auto">
          <v-btn 
            @click="jugarSolitario('Piedra')"
            density="comfortable"
          >
            🪨 Piedra
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn 
            @click="jugarSolitario('Papel')"
            density="comfortable"
          >
            📄 Papel
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn 
            @click="jugarSolitario('Tijeras')"
            density="comfortable"
          >
            ✂️ Tijeras
          </v-btn>
        </v-col>
      </div>
      
      <div v-if="resultadoSolitario" class="mt-4 bg-gray-50 p-4 rounded-lg">
        <p class="text-lg">Tu elección: <strong>{{ resultadoSolitario.tuEleccion }}</strong></p>
        <p class="text-lg">Máquina: <strong>{{ resultadoSolitario.maquinaEleccion }}</strong></p>
        <p class="text-2xl font-bold mt-2" :class="resultadoSolitario.colorClase">
          {{ resultadoSolitario.mensaje }}
        </p>
      </div>
    </div>

    <!-- Resultado del juego multijugador -->
    <div v-if="gameResult" class="bg-white shadow-lg rounded-xl p-6 mb-6 max-w-md w-full">
      <h3 class="text-2xl font-bold mb-4">¡Resultado!</h3>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <p class="font-semibold">{{ gameResult.player1.username }}</p>
          <p class="text-3xl mt-2">{{ getEmoji(gameResult.player1.choice) }}</p>
          <p class="text-lg">{{ gameResult.player1.choice }}</p>
        </div>
        
        <div class="p-4 bg-red-50 rounded-lg">
          <p class="font-semibold">{{ gameResult.player2.username }}</p>
          <p class="text-3xl mt-2">{{ getEmoji(gameResult.player2.choice) }}</p>
          <p class="text-lg">{{ gameResult.player2.choice }}</p>
        </div>
      </div>

      <div class="text-2xl font-bold mt-4" :class="getResultClass(gameResult.resultado)">
        {{ getResultText(gameResult.resultado) }}
      </div>

      <v-btn 
        @click="nuevaRonda"
        class="mt-4"
        color="primary"
      >
        Nueva Ronda
      </v-btn>
    </div>

    <!-- Botón volver -->
    <div>
      <v-btn
        @click="volverInicio"
        class="mt-6 px-8 py-3 text-lg font-medium"
      >
        Volver al inicio
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWebSocket } from '../composables/useWebSocket'

const router = useRouter()

// WebSocket
const { 
  currentRoom, 
  currentUsername,
  mensaje,
  players,
  gameResult,
  waitingForOpponent,
  hacerEleccion,
  disconnect 
} = useWebSocket()

// Estado local
const eleccion = ref('')
const eleccionHecha = ref(false)
const resultadoSolitario = ref(null)

// Seleccionar opción en modo multijugador
function seleccionar(opcion) {
  if (!eleccionHecha.value) {
    eleccion.value = opcion
    eleccionHecha.value = true
    hacerEleccion(opcion)
  }
}

// Jugar en modo solitario
function jugarSolitario(tuEleccion) {
  const opciones = ['Piedra', 'Papel', 'Tijeras']
  const maquinaEleccion = opciones[Math.floor(Math.random() * 3)]
  
  let mensaje = ''
  let colorClase = ''
  
  if (tuEleccion === maquinaEleccion) {
    mensaje = '¡Empate!'
    colorClase = 'text-yellow-600'
  } else if (
    (tuEleccion === 'Piedra' && maquinaEleccion === 'Tijeras') ||
    (tuEleccion === 'Papel' && maquinaEleccion === 'Piedra') ||
    (tuEleccion === 'Tijeras' && maquinaEleccion === 'Papel')
  ) {
    mensaje = '¡Ganaste! 🎉'
    colorClase = 'text-green-600'
  } else {
    mensaje = 'Perdiste 😢'
    colorClase = 'text-red-600'
  }
  
  resultadoSolitario.value = {
    tuEleccion,
    maquinaEleccion,
    mensaje,
    colorClase
  }
}

// Nueva ronda
function nuevaRonda() {
  eleccion.value = ''
  eleccionHecha.value = false
  gameResult.value = null
}

// Volver al inicio
function volverInicio() {
  if (currentRoom.value) {
    disconnect()
  }
  router.push('/conexion')
}

// Obtener emoji según elección
function getEmoji(choice) {
  const emojis = {
    'Piedra': '🪨',
    'Papel': '📄',
    'Tijeras': '✂️'
  }
  return emojis[choice] || '❓'
}

// Obtener texto del resultado
function getResultText(resultado) {
  if (resultado === 'empate') {
    return '¡Empate!'
  } else if (resultado === 'player1') {
    return gameResult.value.player1.username === currentUsername.value 
      ? '¡Ganaste! 🎉' 
      : '¡Perdiste! 😢'
  } else {
    return gameResult.value.player2.username === currentUsername.value 
      ? '¡Ganaste! 🎉' 
      : '¡Perdiste! 😢'
  }
}

// Obtener clase CSS del resultado
function getResultClass(resultado) {
  if (resultado === 'empate') {
    return 'text-yellow-600'
  } else if (resultado === 'player1') {
    return gameResult.value.player1.username === currentUsername.value 
      ? 'text-green-600' 
      : 'text-red-600'
  } else {
    return gameResult.value.player2.username === currentUsername.value 
      ? 'text-green-600' 
      : 'text-red-600'
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse > div {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-pulse > div:nth-child(2) {
  animation-delay: 0.2s;
}

.animate-pulse > div:nth-child(3) {
  animation-delay: 0.4s;
}
</style>