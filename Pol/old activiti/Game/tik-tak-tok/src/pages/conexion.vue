<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
    <h1 class="text-2xl font-bold mb-8">Rock, Paper, Scissors Online</h1>

    <!-- Section 1: Create / Join Room -->
    <div class="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
      <h2 class="text-xl font-semibold mb-4 text-center">Private Room</h2>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Username:</label>
        <input
          v-model="username"
          type="text"
          placeholder="Your name..."
          class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Room name:</label>
        <input
          v-model="roomName"
          type="text"
          placeholder="e.g. Room1"
          class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div class="flex gap-2 justify-center">
        <v-col cols="auto">
          <v-btn @click="createRoom" density="comfortable" :disabled="!username || !roomName">
            Create Room
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="joinRoom" density="comfortable" :disabled="!username || !roomName">
            Join Room
          </v-btn>
        </v-col>
      </div>

      <p v-if="message" class="text-center mt-4 text-gray-600">{{ message }}</p>

      <!-- Connection Indicator -->
      <div class="mt-4 flex items-center justify-center gap-2">
        <div class="w-3 h-3 rounded-full" :class="isConnected ? 'bg-green-500' : 'bg-red-500'"></div>
        <span class="text-sm">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
      </div>
    </div>

    <!-- Section 2: Play Solo -->
    <div class="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center mt-6">
      <h2 class="text-xl font-semibold mb-4">Play Solo</h2>
      <div>
        <v-col cols="auto">
          <v-btn to="/game" density="comfortable"> Click here to play solo </v-btn>
        </v-col>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWebSocket } from '../composables/useWebSocket'

const router = useRouter()
const username = ref('')
const roomName = ref('')

const {
  isConnected,
  message,
  connect,
  createRoom: wsCreateRoom,
  joinRoom: wsJoinRoom,
  currentRoom,
} = useWebSocket()

onMounted(() => {
  connect()
})

function createRoom() {
  if (username.value && roomName.value) {
    wsCreateRoom(roomName.value, username.value)
    setTimeout(() => {
      if (currentRoom.value) router.push('/game')
    }, 500)
  } else {
    message.value = 'Please enter a name and room.'
  }
}

function joinRoom() {
  if (username.value && roomName.value) {
    wsJoinRoom(roomName.value, username.value)
    setTimeout(() => {
      if (currentRoom.value) router.push('/game')
    }, 500)
  } else {
    message.value = 'Please enter a name and room.'
  }
}
</script>
