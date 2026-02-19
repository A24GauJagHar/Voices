const crypto = require("crypto");
const fs = require("fs");

const missatge = fs.readFileSync("missatge.txt");
const bobPrivateKey = fs.readFileSync("bob_private.pem");

const sign = crypto.sign("sha256", missatge, bobPrivateKey);

fs.writeFileSync("signatura.txt", sign.toString("base64"));
console.log("Missatge signat per Bob");
