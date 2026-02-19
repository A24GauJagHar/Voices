import express from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = 3000;

app.use(express.json());

// Exemple de preguntes (normalment vindrien d’un fitxer JSON)
const preguntesBase = [
  { id: 1, question: "2+2?", answers: ["3", "4", "5"], correctAnswer: 1 },
  { id: 2, question: "Capital de França?", answers: ["Berlin", "Paris", "Madrid"], correctAnswer: 1 },
  { id: 3, question: "Color del cel?", answers: ["Blau", "Verd", "Vermell"], correctAnswer: 0 }
];

// Diccionari de sessions (per idUsuari)
const sessions = {};

// Ruta getPreguntes
app.post("/getPreguntes", (req, res) => {
  const num = req.body?.num || 1;

  if (typeof num !== "number" || num <= 0) {
    return res.status(400).json({ error: "Camp 'num' invàlid" });
  }

  // Seleccionem preguntes a l'atzar
  const seleccionades = preguntesBase
    .sort(() => 0.5 - Math.random())
    .slice(0, num);

  const idUsuari = uuidv4();

  // Guardem respostes correctes
  sessions[idUsuari] = {
    correctes: seleccionades.map((p) => p.correctAnswer),
  };

  // Enviem preguntes sense resposta correcta
  const senseCorrecta = seleccionades.map((p) => ({
    id: p.id,
    question: p.question,
    answers: p.answers,
  }));

  res.json({ idUsuari, preguntes: senseCorrecta });
});

// Ruta finalista
app.post("/finalista", (req, res) => {
  const { idUsuari, respostes } = req.body || {};

  if (!idUsuari || !Array.isArray(respostes)) {
    return res.status(400).json({ error: "Falten camps obligatoris" });
  }

  const sessio = sessions[idUsuari];
  if (!sessio) {
    return res.status(400).json({ error: "Sessió no trobada" });
  }

  let correct = 0;
  let wrong = 0;

  sessio.correctes.forEach((c, i) => {
    if (respostes[i] === c) {
      correct++;
    } else {
      wrong++;
    }
  });

  res.json({
    correctes: correct,
    wrong,
    total: sessio.correctes.length,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});
