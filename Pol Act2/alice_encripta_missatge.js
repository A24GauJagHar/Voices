const crypto = require("crypto");
const fs = require("fs");

const missatge = fs.readFileSync("missatge.txt", "utf8");
const bobPublicKey = fs.readFileSync("bob_public.pem");

const encrypted = crypto.publicEncrypt(bobPublicKey, Buffer.from(missatge));

fs.writeFileSync("missatge_encriptat.txt", encrypted.toString("base64"));
console.log("Missatge encriptat per Bob");
