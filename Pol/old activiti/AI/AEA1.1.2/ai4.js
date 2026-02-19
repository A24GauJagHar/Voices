const brain = require("brain.js");
const fs = require("fs");

// Carreguem el model
const savedModel = JSON.parse(fs.readFileSync("model.json"));
const net = new brain.NeuralNetwork();
net.fromJSON(savedModel);

// Alumne nou
const alumneNou = {
  assistencia: 0.8,
  activitats: 0.85,
  retard: 0.2,
  curs: 1.0,      // curs actual (normalitzat)
  repetidor: 0
};

console.log("Abans de run()");
console.log("Predicció alumne nou:", net.run(alumneNou));
console.log("Després de run()");