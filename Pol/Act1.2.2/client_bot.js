import { WebSocket } from 'ws';

const ws = new WebSocket("ws://localhost:8080");

ws.on('open', () => {
  console.log(`connectat`);

  // Conseguiu l'identificador del nostre client. 
  ws.send(JSON.stringify({}));

 

  let next = Date.now() + 5000;
  const id = setInterval(() => {
  const now = Date.now();
  // feina... next += 5000;
  const drift = next - now;
  if (drift < 0) {
    function feina() {
      console.log('faig feina');
      }
      feina();
  next = now + 5000; }
  }, 5);
  // tick curt per comprovar i ajustar (patró avançat)

  // fer un setInterval per enviar missatges cada X segons. 
});

function aleatori() {
    return Math.floor(Math.random() * 100000);
  }