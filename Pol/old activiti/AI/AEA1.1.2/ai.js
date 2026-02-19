// Importem brain.js
const brain = require("brain.js");

// Definim una xarxa neuronal simple (feedforward)
const net = new brain.NeuralNetwork({ hiddenLayers: [3] });

/*
   Exemple: gustos de persones.
   Cada persona té una entrada amb preferències (1 = li agrada, 0 = no)
   i una sortida amb el "gust a predir".
   
   Inputs:
     - ball
     - videojocs
     - natura

   Output:
     - salsa (li agradarà la salsa, sí o no)
*/

const trainingData = [
  // Persones molt de ball → salsa gairebé sempre positiva
  { input: { ball: 1, videojocs: 0, natura: 0 }, output: { salsa: 1 } },
  { input: { ball: 1, videojocs: 0.2, natura: 0.3 }, output: { salsa: 1 } },
  { input: { ball: 0.9, videojocs: 0.5, natura: 0 }, output: { salsa: 1 } },
  { input: { ball: 0.8, videojocs: 0.2, natura: 0.6 }, output: { salsa: 0.9 } },

  // Persones poc de ball → salsa negativa
  { input: { ball: 0, videojocs: 1, natura: 0 }, output: { salsa: 0 } },
  { input: { ball: 0.1, videojocs: 0.9, natura: 0.3 }, output: { salsa: 0.1 } },
  { input: { ball: 0.2, videojocs: 0.7, natura: 0.6 }, output: { salsa: 0.2 } },
  { input: { ball: 0.3, videojocs: 0.8, natura: 0.2 }, output: { salsa: 0.1 } },

  // Persones de natura, però no ballar → salsa baixa
  { input: { ball: 0.1, videojocs: 0.2, natura: 1 }, output: { salsa: 0.2 } },
  { input: { ball: 0.2, videojocs: 0, natura: 0.9 }, output: { salsa: 0.3 } },

  // Persones equilibrades, ball mitjà → salsa intermèdia
  { input: { ball: 0.5, videojocs: 0.5, natura: 0.5 }, output: { salsa: 0.5 } },
  { input: { ball: 0.6, videojocs: 0.4, natura: 0.4 }, output: { salsa: 0.6 } },
];


// Entrenem la xarxa
net.train(trainingData, {
  iterations: 2000, // nombre de passades
  learningRate: 0.3,
  log: (stats) => console.log(stats),        // mostra informació d’entrenament
  logPeriod: 500,   // cada quantes iteracions mostra log
});

// Ara fem una predicció amb "els teus gustos"
const me = { ball: 1, videojocs: 1, natura: 0 };

// El resultat és un número entre 0 i 1 (com a probabilitat)
const output = net.run(me);

console.log("Predicció segons els teus gustos:");
console.log(output); // { salsa: 0.12 } per ex. → baixa probabilitat