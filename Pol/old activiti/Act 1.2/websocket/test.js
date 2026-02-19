import WebSocket from 'ws';  

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected to server');
  ws.send('Hello from Harsh');
});

ws.on('message', (data) => {
  console.log('Received from server:', data.toString());
});

ws.on('error', (err) => console.error('WebSocket error:', err));

ws.on('close', () => console.log('Disconnected from server'));

//import { WebSocketServer } from 'ws';

//const wss = new WebSocketServer({ port: 8080 });

//wss.on('connection', function connection(ws) {
//  ws.on('error', console.error);
//
//  ws.on('message', function message(data) {
//    console.log('received: %s', data);
//  });
//
//  ws.send('something');
//});