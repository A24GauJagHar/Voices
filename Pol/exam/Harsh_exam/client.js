const modulHttp = require('http');
const modulExpress = require('express');
const { WebSocketServer: ServidorWS } = require('ws');

const aplicacio = modulExpress();
aplicacio.use(modulExpress.json());

let estatAssistencia = {
  nomAlumne: "Harsh Gautambhai Jagani",
  diesAssistencia: [
    { dataAssistencia: "5", estatDia: "RETARD" }
  ],
};

const ESTATS_PERMESOS = new Set(["PRESENT", "RETARD", "FALTA"]);

function trobarIndexPerData(data) {
  return estatAssistencia.diesAssistencia.findIndex(
    d => d.dataAssistencia === String(data)
  );
}

const servidorHttp = modulHttp.createServer(aplicacio);

const servidorWS = new ServidorWS({ noServer: true });

function enviarJSONATots(obj) {
  const missatge = JSON.stringify(obj);
  servidorWS.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(missatge);
    }
  });
}

aplicacio.get('/api/attendance/state', (req, res) => {
  res.json({
    ok: true,
    estatAssistencia: estatAssistencia
  });
});

aplicacio.post('/api/attendance/day', (req, res) => {
  const cos = req.body;

  if (!cos || cos.dataAssistencia === undefined || cos.estatDia === undefined) {
    return res.status(400).json({
      ok: false,
      error: "El cos de la petició ha de contenir dataAssistencia i estatDia"
    });
  }

  const dataNova = String(cos.dataAssistencia);
  const estatNou = String(cos.estatDia).toUpperCase();

  if (!ESTATS_PERMESOS.has(estatNou)) {
    return res.status(400).json({
      ok: false,
      error: `estatDia ha de ser un d'aquests: ${Array.from(ESTATS_PERMESOS).join(', ')}`
    });
  }

  if (trobarIndexPerData(dataNova) !== -1) {
    return res.status(400).json({
      ok: false,
      error: "Ja existeix un registre per aquesta data"
    });
  }

  estatAssistencia.diesAssistencia.push({
    dataAssistencia: dataNova,
    estatDia: estatNou
  });

  enviarJSONATots({
    tipusEsdeveniment: "assistencia-actualitzada",
    tipusCanvi: "CREAT",
    dataModificada: dataNova,
    estatAssistencia: estatAssistencia
  });

  res.json({
    ok: true,
    estatAssistencia: estatAssistencia
  });
});

aplicacio.put('/api/attendance/day/:dataAssistencia', (req, res) => {
  const dataSollicitada = String(req.params.dataAssistencia);
  const cos = req.body;

  if (!cos || cos.estatDia === undefined) {
    return res.status(400).json({
      ok: false,
      error: "El cos de la petició ha de contenir estatDia"
    });
  }

  const nouEstat = String(cos.estatDia).toUpperCase();

  if (!ESTATS_PERMESOS.has(nouEstat)) {
    return res.status(400).json({
      ok: false,
      error: `estatDia ha de ser un d'aquests: ${Array.from(ESTATS_PERMESOS).join(', ')}`
    });
  }

  const index = trobarIndexPerData(dataSollicitada);
  if (index === -1) {
    return res.status(404).json({
      ok: false,
      error: "No s'ha trobat cap registre per aquesta data"
    });
  }

  estatAssistencia.diesAssistencia[index].estatDia = nouEstat;

  enviarJSONATots({
    tipusEsdeveniment: "assistencia-actualitzada",
    tipusCanvi: "ACTUALITZAT",
    dataModificada: dataSollicitada,
    estatAssistencia: estatAssistencia
  });

  res.json({
    ok: true,
    estatAssistencia: estatAssistencia
  });
});

aplicacio.delete('/api/attendance/day/:dataAssistencia', (req, res) => {
  const dataEliminar = String(req.params.dataAssistencia);
  const index = trobarIndexPerData(dataEliminar);

  if (index === -1) {
    return res.status(404).json({
      ok: false,
      error: "No s'ha trobat cap registre per aquesta data"
    });
  }

  estatAssistencia.diesAssistencia.splice(index, 1);

  enviarJSONATots({
    tipusEsdeveniment: "assistencia-actualitzada",
    tipusCanvi: "ESBORRAT",
    dataModificada: dataEliminar,
    estatAssistencia: estatAssistencia
  });

  res.json({
    ok: true,
    estatAssistencia: estatAssistencia
  });
});

servidorHttp.on('upgrade', (req, socket, head) => {
  servidorWS.handleUpgrade(req, socket, head, (ws) => {
    servidorWS.emit('connection', ws, req);
  });
});

servidorWS.on('connection', (ws) => {
  const missatgeInicial = {
    tipusEsdeveniment: "assistencia-inicial",
    estatAssistencia: estatAssistencia
  };

  ws.send(JSON.stringify(missatgeInicial));
});

const PORT = 5000;

servidorHttp.listen(PORT, () => {
  console.log(`Servidor funcionant. HTTP: http://localhost:${PORT}`);
});
