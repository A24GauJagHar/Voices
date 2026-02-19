import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 3000 });

console.log('WebSocket server running on ws://localhost:3000');

server.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('error', console.error);

  socket.on('message', (data) => {
    console.log(`Received: ${data}`);
    // Echo message back to the same client
    socket.send(`Echo: ${data}`);
  });

  socket.send('Welcome to the WebSocket server!');
});
