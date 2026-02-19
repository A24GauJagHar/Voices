import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
  },
})

// Store game rooms
const rooms = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Create room
  socket.on('create-room', ({ roomName, username }) => {
    if (rooms.has(roomName)) {
      socket.emit('room-error', 'Room already exists')
      return
    }
    const room = {
      name: roomName,
      players: [{ id: socket.id, username, choice: null, ready: false }],
      gameStarted: false,
    }
    rooms.set(roomName, room)
    socket.join(roomName)
    socket.emit('room-created', { roomName, username })
    console.log(`Room ${roomName} created by ${username}`)
  })

  // Join room
  socket.on('join-room', ({ roomName, username }) => {
    const room = rooms.get(roomName)
    if (!room) {
      socket.emit('room-error', 'Room does not exist')
      return
    }
    if (room.players.length >= 2) {
      socket.emit('room-error', 'Room is full')
      return
    }
    room.players.push({ id: socket.id, username, choice: null, ready: false })
    socket.join(roomName)
    socket.emit('room-joined', { roomName, username })
    io.to(roomName).emit('players-ready', {
      players: room.players.map((p) => ({ username: p.username, ready: p.ready })),
    })
    console.log(`${username} joined room ${roomName}`)
  })

  // Player makes a choice
  socket.on('make-choice', ({ roomName, choice }) => {
    const room = rooms.get(roomName)
    if (!room) return

    const player = room.players.find((p) => p.id === socket.id)
    if (!player) return

    player.choice = choice
    player.ready = true

    io.to(roomName).emit('player-ready', { username: player.username })

    if (room.players.length === 2 && room.players.every((p) => p.ready)) {
      const [player1, player2] = room.players
      const result = getWinner(player1.choice, player2.choice)

      io.to(roomName).emit('game-result', {
        player1: { username: player1.username, choice: player1.choice },
        player2: { username: player2.username, choice: player2.choice },
        result,
      })

      room.players.forEach((p) => {
        p.choice = null
        p.ready = false
      })
    }
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    for (const [roomName, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id)
      if (playerIndex !== -1) {
        const player = room.players[playerIndex]
        room.players.splice(playerIndex, 1)
        io.to(roomName).emit('player-disconnected', { username: player.username })
        if (room.players.length === 0) {
          rooms.delete(roomName)
          console.log(`Room ${roomName} deleted`)
        }
        break
      }
    }
  })
})

// Determine winner
function getWinner(choice1, choice2) {
  if (choice1 === choice2) return 'draw'
  const wins = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' }
  return wins[choice1] === choice2 ? 'player1' : 'player2'
}

const PORT = 3000
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running at http://localhost:${PORT}`)
})
