const crypto = require("crypto");
const fs = require("fs");

const missatge = fs.readFileSync("missatge.txt");
const signatura = Buffer.from(fs.readFileSync("signatura.txt", "utf8"), "base64");
const bobPublicKey = fs.readFileSync("bob_public.pem");

const valid = crypto.verify("sha256", missatge, bobPublicKey, signatura);

console.log("Signatura vàlida?", valid);
