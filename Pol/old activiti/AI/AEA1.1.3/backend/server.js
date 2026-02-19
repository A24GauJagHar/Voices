const WebSocket = require("ws");
const brain = require("brain.js");
const fs = require("fs");
const natural = require("natural");

const wss = new WebSocket.Server({ port: 3000 });
console.log("Servidor WebSocket escuchando en puerto 3000");

const net = new brain.NeuralNetwork({ hiddenLayers: [6] });

const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmerEs;
const analyzer = new Analyzer("Spanish", stemmer, "afinn");

// Función para obtener sentimiento normalizado (0 a 1)
function analitzarActitud(frase) {
  const score = analyzer.getSentiment(frase.split(" "));
  return Math.min(Math.max((score + 5) / 10, 0), 1);
}

// Dataset inicial vacío (puedes cargar ejemplos aquí)
let trainingData = [];

// Cargar modelo si existe
if (fs.existsSync("modelo.json")) {
  const modelData = JSON.parse(fs.readFileSync("modelo.json", "utf8"));
  net.fromJSON(modelData);
  console.log("Modelo cargado ✅");
}

wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "train") {
      const payload = data.payload;
      const sentiment = analitzarActitud(payload.frase);

      const input = {
        faltes: payload.faltes / 30,
        retards: payload.retards / 30,
        percentDintre: payload.enTermini,
        percentTard: payload.foraTermini,
        actitud: payload.actitud || 1,
        sentiment: sentiment
      };

      trainingData.push({ input, output: { nota: payload.nota / 10 } });

      net.train(trainingData, { iterations: 500, learningRate: 0.3, log: false });

      ws.send(JSON.stringify({ type: "trained", message: "Modelo entrenado ✅" }));
    }

    if (data.type === "predict") {
      const payload = data.payload;
      const sentiment = analitzarActitud(payload.frase);

      const input = {
        faltes: payload.faltes / 30,
        retards: payload.retards / 30,
        percentDintre: payload.enTermini,
        percentTard: payload.foraTermini,
        actitud: payload.actitud || 1,
        sentiment: sentiment
      };

      const output = net.run(input);
      const notaPredicha = (output.nota * 10).toFixed(2);
      const actitudPredicha = sentiment >= 0.5 ? "Positiva" : "Negativa";

      ws.send(JSON.stringify({ type: "prediction", nota: notaPredicha, actitud: actitudPredicha }));
    }

    if (data.type === "save") {
      fs.writeFileSync("modelo.json", JSON.stringify(net.toJSON()));
      ws.send(JSON.stringify({ type: "saved", message: "Modelo guardado ✅" }));
    }

    if (data.type === "load") {
      if (fs.existsSync("modelo.json")) {
        const modelData = JSON.parse(fs.readFileSync("modelo.json", "utf8"));
        net.fromJSON(modelData);
        ws.send(JSON.stringify({ type: "loaded", message: "Modelo cargado ✅" }));
      } else {
        ws.send(JSON.stringify({ type: "error", message: "No hay modelo guardado" }));
      }
    }
  });
});