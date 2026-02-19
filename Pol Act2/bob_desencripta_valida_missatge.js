const crypto = require("crypto");
const fs = require("fs");

const paquet = JSON.parse(fs.readFileSync("paquet.json", "utf8"));

const encrypted = Buffer.from(paquet.missatge_encriptat, "base64");
const signatura = Buffer.from(paquet.signatura, "base64");

const bobPrivateKey = fs.readFileSync("bob_private.pem");
const alicePublicKey = fs.readFileSync("alice_public.pem");

// Desencripta
const decrypted = crypto.privateDecrypt(bobPrivateKey, encrypted);

// Valida signatura
const valid = crypto.verify("sha256", decrypted, alicePublicKey, signatura);

fs.writeFileSync("missatge_final.txt", decrypted.toString());

console.log("Missatge:", decrypted.toString());
console.log("Signatura vàlida?", valid);
