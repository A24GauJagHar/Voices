const crypto = require("crypto");
const fs = require("fs");

const missatge = fs.readFileSync("missatge.txt", "utf8");

const bobPublicKey = fs.readFileSync("bob_public.pem");
const alicePrivateKey = fs.readFileSync("alice_private.pem");

// Encripta
const encrypted = crypto.publicEncrypt(bobPublicKey, Buffer.from(missatge));

// Signa
const sign = crypto.sign("sha256", Buffer.from(missatge), alicePrivateKey);

const obj = {
  missatge_encriptat: encrypted.toString("base64"),
  signatura: sign.toString("base64"),
};

fs.writeFileSync("paquet.json", JSON.stringify(obj, null, 2));
console.log("Missatge encriptat i signat per Alice");
