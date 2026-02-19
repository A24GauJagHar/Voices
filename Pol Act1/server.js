const express = require("express");
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;

// Clau simètrica (hardcoded per pràctica)
const SECRET_KEY = "clau_super_secreta";

// Hash guardat al servidor (memòria)
let storedHash = null;

// ENCRYPT
app.post("/encrypt", (req, res) => {
    const { text } = req.body;
    const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    res.json({ encrypted });
});

// DECRYPT
app.post("/decrypt", (req, res) => {
    const { encrypted } = req.body;
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    res.json({ text });
});

// HASH
app.post("/hash", async (req, res) => {
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    storedHash = hash;
    res.json({ hash });
});

// VERIFY
app.post("/verify", async (req, res) => {
    const { password } = req.body;

    if (!storedHash) return res.json({ ok: false });

    const ok = await bcrypt.compare(password, storedHash);
    res.json({ ok });
});

app.listen(PORT, () => {
    console.log(`Servidor actiu a http://localhost:${PORT}`);
});
