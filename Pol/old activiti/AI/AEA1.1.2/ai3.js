const brain = require("brain.js");
const fs = require("fs");

let net;

// Creem la xarxa o carreguem-ne una d’existent
if (fs.existsSync("model.json")) {
  console.log("📂 Carregant model existent...");
  const savedModel = JSON.parse(fs.readFileSync("model.json"));
  net = new brain.NeuralNetwork({ hiddenLayers: [6] });
  net.fromJSON(savedModel);
} else {
  console.log("🆕 Creant un model nou...");
  net = new brain.NeuralNetwork({ hiddenLayers: [6] });
}

/*
   Inputs:
     - assistencia (0 a 1)
     - activitats (0 a 1)
     - retard (0 a 1)  -> 0 puntual, 1 sempre tard
     - curs (0 a 1)    -> normalitzat, ex: 2024 = 1.0
     - repetidor (0 o 1)

   Output:
     - aprovat (0 = suspès, 1 = aprovat)
*/

// Exemples nous (simulem dades d’un curs)
const trainingData = [
  // ───── Bons alumnes, cursos recents ─────
  { input: { assistencia: 0.95, activitats: 0.95, retard: 0.1, curs: 0.8, repetidor: 0 }, output: { aprovat: 1 } },
  { input: { assistencia: 0.9,  activitats: 0.85, retard: 0.2, curs: 0.8, repetidor: 0 }, output: { aprovat: 0.95 } },
  { input: { assistencia: 0.88, activitats: 0.9,  retard: 0.15, curs: 1.0, repetidor: 0 }, output: { aprovat: 0.95 } },
  { input: { assistencia: 0.92, activitats: 0.8,  retard: 0.25, curs: 1.0, repetidor: 0 }, output: { aprovat: 0.9 } },
  { input: { assistencia: 0.85, activitats: 0.9,  retard: 0.2,  curs: 0.6, repetidor: 0 }, output: { aprovat: 0.9 } },

  // ───── Bons alumnes, però repetidors ─────
  { input: { assistencia: 0.9,  activitats: 0.85, retard: 0.3, curs: 1.0, repetidor: 1 }, output: { aprovat: 0.8 } },
  { input: { assistencia: 0.85, activitats: 0.9,  retard: 0.2, curs: 0.6, repetidor: 1 }, output: { aprovat: 0.75 } },

  // ───── Mitjans, resultats incerts ─────
  { input: { assistencia: 0.65, activitats: 0.6,  retard: 0.4, curs: 0.8, repetidor: 0 }, output: { aprovat: 0.5 } },
  { input: { assistencia: 0.6,  activitats: 0.55, retard: 0.5, curs: 0.4, repetidor: 0 }, output: { aprovat: 0.45 } },
  { input: { assistencia: 0.7,  activitats: 0.6,  retard: 0.35, curs: 0.2, repetidor: 0 }, output: { aprovat: 0.55 } },
  { input: { assistencia: 0.6,  activitats: 0.65, retard: 0.5,  curs: 1.0, repetidor: 1 }, output: { aprovat: 0.4 } },
  { input: { assistencia: 0.7,  activitats: 0.6,  retard: 0.45, curs: 0.8, repetidor: 1 }, output: { aprovat: 0.35 } },

  // ───── Alumnes fluixos ─────
  { input: { assistencia: 0.4,  activitats: 0.5,  retard: 0.6,  curs: 0.6, repetidor: 0 }, output: { aprovat: 0.3 } },
  { input: { assistencia: 0.35, activitats: 0.45, retard: 0.7,  curs: 0.4, repetidor: 0 }, output: { aprovat: 0.2 } },
  { input: { assistencia: 0.3,  activitats: 0.4,  retard: 0.75, curs: 0.8, repetidor: 1 }, output: { aprovat: 0.15 } },
  { input: { assistencia: 0.25, activitats: 0.3,  retard: 0.8,  curs: 1.0, repetidor: 1 }, output: { aprovat: 0.1 } },
  { input: { assistencia: 0.2,  activitats: 0.25, retard: 0.9,  curs: 0.2, repetidor: 0 }, output: { aprovat: 0 } },

  // ───── Casos extrems bons ─────
  { input: { assistencia: 1.0,  activitats: 1.0,  retard: 0.0,  curs: 0.6, repetidor: 0 }, output: { aprovat: 1 } },
  { input: { assistencia: 0.98, activitats: 1.0,  retard: 0.05, curs: 1.0, repetidor: 0 }, output: { aprovat: 1 } },

  // ───── Casos extrems dolents ─────
  { input: { assistencia: 0.0,  activitats: 0.0,  retard: 1.0,  curs: 0.6, repetidor: 1 }, output: { aprovat: 0 } },
  { input: { assistencia: 0.1,  activitats: 0.0,  retard: 1.0,  curs: 0.4, repetidor: 1 }, output: { aprovat: 0 } },

  // ───── Casos fronterers ─────
  { input: { assistencia: 0.75, activitats: 0.7,  retard: 0.3,  curs: 0.6, repetidor: 0 }, output: { aprovat: 0.7 } },
  { input: { assistencia: 0.55, activitats: 0.65, retard: 0.5,  curs: 0.8, repetidor: 0 }, output: { aprovat: 0.45 } },
  { input: { assistencia: 0.6,  activitats: 0.7,  retard: 0.6,  curs: 1.0, repetidor: 1 }, output: { aprovat: 0.35 } },
];


// Entrenem (continuant el model si existia)
net.train(trainingData, {
  iterations: 2000,
  learningRate: 0.3,
  log: (stats) => console.log(stats),
  logPeriod: 500,
});

// Guardem model actualitzat
fs.writeFileSync("model.json", JSON.stringify(net.toJSON()));
console.log("✅ Model entrenat i actualitzat guardat a model.json");
 