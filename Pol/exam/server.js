const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// --- Persistencia de Datos (Manejo del archivo items.json) ---
const DATA_FILE = path.join(__dirname, 'items.json');

function readItems() {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw || '[]'); 
    } catch (e) {
        if (e.code !== 'ENOENT') {
            console.error("Error al leer items.json:", e.message);
        }
        return [];
    }
}

function writeItems(items) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
    } catch (e) {
        console.error("Error al escribir items.json:", e.message);
    }
}
// -----------------------------------------------------------

// Cargar datos iniciales
let items = readItems();
let nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

// A. Configuración Inicial
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;

// Middleware
app.use(express.static('public')); 
app.use(express.json()); 

// B. Función Broadcast
function broadcastItems() {
    writeItems(items); 

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'UPDATE', items: items }));
        }
    });
}

// Conexión WebSocket
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'INITIAL', items: items }));
});

// C. Rutas CRUD (REST)

// 1. POST (Crear)
app.post('/api/items', (req, res) => {
    const { name, quantity } = req.body;
    const parsedQuantity = parseInt(quantity); 

    if (!name || isNaN(parsedQuantity) || parsedQuantity <= 0) { 
        return res.status(400).send({ error: 'Nombre y cantidad válida son requeridos.' });
    }
    
    const newItem = { id: nextId++, name, quantity: parsedQuantity }; 
    items.push(newItem);
    
    res.status(201).send(newItem);
    broadcastItems(); 
});

// 2. DELETE (Borrar)
app.delete('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = items.length;
    
    items = items.filter(item => item.id !== id);
    
    if (items.length < initialLength) {
        res.status(204).send();
        broadcastItems(); 
    } else {
        res.status(404).send({ error: 'Item no encontrado' });
    }
});
// 3. PUT (Actualizar) - ¡NUEVA RUTA!
app.put('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, quantity } = req.body;
    const parsedQuantity = parseInt(quantity);
    
    // Validación de entrada
    if (!name || isNaN(parsedQuantity) || parsedQuantity <= 0) { 
        return res.status(400).send({ error: 'Nombre y cantidad válida son requeridos.' });
    }

    const itemIndex = items.findIndex(item => item.id === id);

    if (itemIndex > -1) {
        // Actualizar el item
        items[itemIndex].name = name;
        items[itemIndex].quantity = parsedQuantity;
        
        res.status(200).send(items[itemIndex]);
        broadcastItems(); // Notificar a todos los clientes
    } else {
        res.status(404).send({ error: 'Item no encontrado para actualizar' });
    }
});

// Iniciar el Servidor
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});