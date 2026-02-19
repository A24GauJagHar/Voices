// index.js
const { connectDB, getDB, closeDB } = require('./db');
/*** Funció per inserir un producte
* Demostra com inserir un únic document a una col·lecció
*/
async function inserirProducte() {
 try {
 // 1. Primer ens connectem a la base de dades
 await connectDB();

 // 2. Obtenim la referència a la base de dades
 const db = getDB();

 // 3. Obtenim (o creem) la col·lecció 'productes'
 // Si la col·lecció no existeix, MongoDB la crea automàticament
 const productes = db.collection('productes');

 // 4. Definim el document que volem inserir
 // És simplement un objecte JavaScript
 const nouProducte = {
 nom: 'Portàtil HP',
 preu: 699.99,
 stock: 15,
 categoria: 'informàtica'
 };

 // 5. Inserim el document a la col·lecció
 // insertOne() retorna un objecte amb informació sobre l'operació
 const resultat = await productes.insertOne(nouProducte);

 // 6. Mostrem el resultat
 console.log(' Producte inserit amb ID:', resultat.insertedId);
 // insertedId conté l'ObjectId del document que acabem d'inserir

 } catch (error) {// Si alguna cosa falla, capturem l'error i el mostrem
 console.error(' Error inserint producte:', error);
 } finally {
 // Sempre tanquem la connexió, tant si ha anat bé com si ha fallat
 await closeDB();
 }
}
// Executem la funció
inserirProducte()