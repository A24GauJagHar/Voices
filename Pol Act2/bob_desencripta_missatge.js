const crypto = require("crypto");
const fs = require("fs");

const encrypted = Buffer.from(fs.readFileSync("missatge_encriptat.txt", "utf8"), "base64");
const bobPrivateKey = fs.readFileSync("bob_private.pem");

const decrypted = crypto.privateDecrypt(bobPrivateKey, encrypted);

fs.writeFileSync("missatge_desencriptat.txt", decrypted.toString());
console.log("Missatge desencriptat");
