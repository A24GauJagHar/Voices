const brain = require("brain.js");

// Definim la xarxa neuronal
const net = new brain.NeuralNetwork({ hiddenLayers: [4] });

/*
   Inputs:
     - hora (normalitzada 0 a 1, on 0 = mitjanit, 1 = 23:59)
     - dia (0 = dilluns, 1 = dimarts ... 6 = diumenge → normalitzat a 0..1)
     - tipusVideo (1 si és video, 0 si no)
     - tipusFoto  (1 si és foto, 0 si no)
     - tipusText  (1 si és text, 0 si no)

   Output:
     - èxit (probabilitat que tingui bones interaccions)
*/

// Dades d’entrenament d’exemple
const trainingData = [
  // Vídeos solen funcionar millor a la tarda/nit i cap de setmana
  { input: { hora: 0.8, dia: 0.6, video: 1, foto: 0, text: 0 }, output: { exit: 1 } },
  { input: { hora: 0.7, dia: 0.9, video: 1, foto: 0, text: 0 }, output: { exit: 0.9 } },
  { input: { hora: 0.2, dia: 0.3, video: 1, foto: 0, text: 0 }, output: { exit: 0.2 } },

  // Fotos solen funcionar al matí i migdia
  { input: { hora: 0.3, dia: 0.4, video: 0, foto: 1, text: 0 }, output: { exit: 0.8 } },
  { input: { hora: 0.4, dia: 0.7, video: 0, foto: 1, text: 0 }, output: { exit: 0.9 } },
  { input: { hora: 0.9, dia: 0.2, video: 0, foto: 1, text: 0 }, output: { exit: 0.3 } },

  // Textos funcionen millor entre setmana al matí
  { input: { hora: 0.2, dia: 0.1, video: 0, foto: 0, text: 1 }, output: { exit: 0.9 } },
  { input: { hora: 0.25, dia: 0.2, video: 0, foto: 0, text: 1 }, output: { exit: 0.8 } },
  { input: { hora: 0.7, dia: 0.8, video: 0, foto: 0, text: 1 }, output: { exit: 0.2 } },
];

// Entrenem la xarxa
net.train(trainingData, {
  iterations: 2000,
  learningRate: 0.3,
  log: (stats) => console.log(stats),
  logPeriod: 500,
});

// Exemple: volem saber si publicar un vídeo dissabte a les 20h és bona idea
const hora = 20 / 24;   // 20h → 0.83
const dia = 6 / 6;      // dissabte (6 sobre 6 dies → 1.0)
const input = { hora, dia, video: 1, foto: 0, text: 0 };

const result = net.run(input);
console.log("Predicció per dissabte 20h vídeo:", result);

// Exemple: una foto dimarts a les 11h
const inputFoto = { hora: 11 / 24, dia: 1 / 6, video: 0, foto: 1, text: 0 };
console.log("Predicció per dimarts 11h foto:", net.run(inputFoto));
 