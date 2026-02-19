import { ref, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

const socket = ref(null)
const isConnected = ref(false)
const currentRoom = ref('')
const currentUsername = ref('')

export function useWebSocket() {
  const message = ref('')
  const players = ref([])
  const gameResult = ref(null)
  const waitingForOpponent = ref(false)

  const connect = () => {
    if (socket.value && socket.value.connected) return

    socket.value = io('http://localhost:3000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('✅ Connected to WebSocket server')
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('❌ Disconnected from WebSocket server')
    })

    // Room events
    socket.value.on('room-created', ({ roomName, username }) => {
      currentRoom.value = roomName
      currentUsername.value = username
      message.value = `Room "${roomName}" created. Waiting for opponent...`
      waitingForOpponent.value = true
    })

    socket.value.on('room-joined', ({ roomName, username }) => {
      currentRoom.value = roomName
      currentUsername.value = username
      message.value = `You joined room "${roomName}"`
    })

    socket.value.on('room-error', (error) => {
      message.value = error
    })

    socket.value.on('players-ready', ({ players: playerList }) => {
      players.value = playerList
      waitingForOpponent.value = false
      message.value = 'Both players connected! Make your choice.'
    })

    socket.value.on('player-ready', ({ username }) => {
      message.value = `${username} has made their choice...`
    })

    socket.value.on('game-result', (result) => {
      gameResult.value = result
    })

    socket.value.on('player-disconnected', ({ username }) => {
      message.value = `${username} has disconnected.`
      waitingForOpponent.value = true
      gameResult.value = null
    })
  }

  const createRoom = (roomName, username) => {
    if (socket.value) socket.value.emit('create-room', { roomName, username })
  }

  const joinRoom = (roomName, username) => {
    if (socket.value) socket.value.emit('join-room', { roomName, username })
  }

  const makeChoice = (choice) => {
    if (socket.value && currentRoom.value) {
      socket.value.emit('make-choice', { roomName: currentRoom.value, choice })
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.removeAllListeners()
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      currentRoom.value = ''
      currentUsername.value = ''
    }
  }

  onUnmounted(disconnect)

  return {
    socket,
    isConnected,
    currentRoom,
    currentUsername,
    message,
    players,
    gameResult,
    waitingForOpponent,
    connect,
    createRoom,
    joinRoom,
    makeChoice,
    disconnect,
  }
}
