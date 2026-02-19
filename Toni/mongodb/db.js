require('dotenv').config(); // Carrega les variables del fitxer .env
const { MongoClient } = require('mongodb'); // Importem MongoClient del paquet mongodb
// Obtenim la URI de connexió des de les variables d'entorn
const uri = process.env.MONGODB_URI;
// Creem una instància del client de MongoDB
// Aquest objecte ens permetrà connectar-nos i interactuar amb la base de dades
const client = new MongoClient(uri);
// Variable per guardar la referència a la base de dades un cop connectada
let database = null;
/**
* Funció per connectar a MongoDB
* Aquesta funció s'ha de cridar abans de fer qualsevol operació amb la BD
* @returns {Promise<Db>} Retorna la referència a la base de dades
*/
async function connectDB() {
 try {
 // Intentem connectar al servidor de MongoDB
 await client.connect();
 console.log(' Connectat a MongoDB Atlas');

 database = client.db('botiga');

 return database;
 } catch (error) {
 // Si hi ha qualsevol error durant la connexió, el capturem
 console.error(' Error connectant a MongoDB:', error);
 throw error; // Re-llancem l'error perquè qui crida la funció el pugui gestionar
 }
}
/**
* Funció per obtenir la base de dades
* Retorna la referència a la BD si ja està connectada
* @returns {Db} La base de dades
*/
function getDB() {
 // Si encara no hem connectat, mostrem un error
 if (!database) {
 throw new Error(' Base de dades no connectada! Crida connectDB() primer.');
 }
 return database;
}
/**
* Funció per tancar la connexió
* És important tancar la connexió quan l'aplicació acaba
*/
async function closeDB() {
 try {
 await client.close();
 console.log(' Connexió tancada');
 } catch (error) {
 console.error(' Error tancant la connexió:', error);
 throw error;
 }
}
// Exportem les funcions perquè es puguin utilitzar des d'altres fitxers
module.exports = {
 connectDB,
 getDB,
 closeDB
};
