/*

**********************************ATIVIDAD 1****************************************************************************

const express = require('express')
const app = express()
const port = 3000

const users = [
  { user: "harsh", password: "1234", roles: ["administrador"] },
  { user: "joel", password: "hola", roles: ["client", "editor"] },
  { user: "pariskar", password: "hello", roles: ["client"] },
]

app.get('/auth', (req, res) => {
  const { user, password } = req.query   

  const found = users.find(u => u.user === user && u.password === password)

  if (found) {
    res.json({ isAuth: true, roles: found.roles })
  } else {
    res.json({ isAuth: false, roles: [] })
  }
})

app.post('/auth', (req, res) => {
  const { user, password } = req.query   

  const found = users.find(u => u.user === user && u.password === password)

  if (found) {
    res.json({ isAuth: true, roles: found.roles })
  } else {
    res.json({ isAuth: false, roles: [] })
  }
})

app.listen(port, () => {
  console.log(`Servidor escoltant al port ${port}`)
})

******************************************* ACTIVIDAD 2 **********************************************************
*/



import express from "express";
import { v4 as uuidv4 } from 'uuid';
const app = express();
app.use(express.json());

const PORT = 3000;

// Exemple de preguntes (en realitat les llegiríeu del fitxer JSON)
const preguntesBase = [
  { id: 1, question: "2+2?", answers: ["3", "4", "5"], correctAnswer: 1 },
  { id: 2, question: "Capital de França?", answers: ["Berlin", "Paris", "Madrid"], correctAnswer: 1 },
  { id: 3, question: "Color del cel?", answers: ["Blau", "Verd", "Vermell"], correctAnswer: 0 }
];

// Diccionari per sessions
const sessions = [];

// Ruta getPreguntes
app.post('/getPreguntes', (req, res) => {
  const num = req.body.num || 1;

  // Seleccionem preguntes a l'atzar
  const seleccionades = preguntesBase.sort(() => 0.5 - Math.random()).slice(0, num);

  const idUsuari = uuidv4();

  // Guardem respostes correctes
  sessions[idUsuari] = {
    correctes: seleccionades.map(p => p.correctAnswer)
  };

  // Enviem preguntes sense resposta correcta
  const senseCorrecta = seleccionades.map(p => ({
    id: p.id,
    question: p.question,
    answers: p.answers
  }));

  res.json({ idUsuari, preguntes: senseCorrecta });
});

// Ruta finalista
app.post('/finalista', (req, res) => {
  const { idUsuari, respostes } = req.body;

  const sessio = sessions[idUsuari];
  if (!sessio) {
    return res.status(400).json({ error: "Sessió no trobada" });
  }

  let encerts = 0;
  let fallo = 0;
  sessio.correctes.forEach((c, i) => {
    if (respostes [i] === c){
      encerts++;
    }  else {
      fallo++;
    }
  });

  res.json({
    correctes: encerts ,
    fallos: fallo,
    total: sessio.correctes.length
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});

/*
**************************************************** ACTIVIDAD 3 ********************************************************


import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('hola');
});


function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('shola');
}

******************************************************** ACTIVIDAD 4 *******************************************************************



import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('> nova connexió');

  ws.on('message', (raw) => {

    // feu un console.log del que rebeue n el format Client x - Missatge: 342434
    // aquí parsegeu i reemetreu
  });

  ws.on('close', () => {
    console.log('> connexió tancada');
  });
});

console.log('Servidor WS al port 8080');

*/