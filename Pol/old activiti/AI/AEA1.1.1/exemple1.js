// exemple1.js
const brain = require("brain.js");

// Simple neural network with 1 hidden layer of 3 neurons
const net = new brain.NeuralNetwork({ hiddenLayers: [3] });

// Training data
const trainingData = [
  { input: { ball: 1, videojocs: 0, natura: 0 }, output: { salsa: 1 } },
  { input: { ball: 1, videojocs: 0.2, natura: 0.3 }, output: { salsa: 1 } },
  { input: { ball: 0.9, videojocs: 0.5, natura: 0 }, output: { salsa: 1 } },
  { input: { ball: 0.8, videojocs: 0.2, natura: 0.6 }, output: { salsa: 0.9 } },

  { input: { ball: 0, videojocs: 1, natura: 0 }, output: { salsa: 0 } },
  { input: { ball: 0.1, videojocs: 0.9, natura: 0.3 }, output: { salsa: 0.1 } },
  { input: { ball: 0.2, videojocs: 0.7, natura: 0.6 }, output: { salsa: 0.2 } },
  { input: { ball: 0.3, videojocs: 0.8, natura: 0.2 }, output: { salsa: 0.1 } },

  { input: { ball: 0.1, videojocs: 0.2, natura: 1 }, output: { salsa: 0.2 } },
  { input: { ball: 0.2, videojocs: 0, natura: 0.9 }, output: { salsa: 0.3 } },

  { input: { ball: 0.5, videojocs: 0.5, natura: 0.5 }, output: { salsa: 0.5 } },
  { input: { ball: 0.6, videojocs: 0.4, natura: 0.4 }, output: { salsa: 0.6 } },
];

// Train
net.train(trainingData, {
  iterations: 2000,
  learningRate: 0.3,
  log: stats => console.log(stats),
  logPeriod: 500,
});

// Predict for you
const me = { ball: 1, videojocs: 1, natura: 0 };
const output = net.run(me);

console.log("Prediction according to your tastes:");
console.log(output);
