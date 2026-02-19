const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let attendanceState = {
    studentName: "Harsh Gautambhai Jagani", 
    attendanceDays: [],
    Assistencia: {}
};

function broadcast(wsServer, dataObj) {
    const data = JSON.stringify(dataObj);
    wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

function successResponse() {
    return {
        attendanceState
    };
}

app.get("/api/attendance/state", (req, res) => {
    return res.json(successResponse());
});

app.post("/api/attendance/day", (req, res) => {
    const { attendanceDate, attendanceStatus } = req.body;

    if (!attendanceDate || !attendanceStatus) {
        return res.json({ ok: false, error: "attendanceDate and attendanceStatus" });
    }

    const exists = attendanceState.attendanceDays.find(
        d => d.attendanceDate === attendanceDate
    );

    if (exists) {
        return res.json({ ok: false, error: "Attendance" });
    }

    attendanceState.attendanceDays.push({ attendanceDate, attendanceStatus });

    res.json(successResponse());

    // enviar notificació WebSocket
    broadcast(wss, {
        eventType: "attendance-updated",
        changeType: "CREATED",
        changedDate: attendanceDate,
        attendanceState
    });
});

app.put("/api/attendance/day/:attendanceDate", (req, res) => {
    const date = req.params.attendanceDate;
    const { attendanceStatus } = req.body;

    const day = attendanceState.attendanceDays.find(d => d.attendanceDate === date);

    if (!day) {
        return res.json({ ok: false, error: "Attendance day not found" });
    }

    day.attendanceStatus = attendanceStatus;

    res.json(successResponse());

    broadcast(wss, {
        eventType: "attendance-updated",
        changeType: "UPDATED",
        changedDate: date,
        attendanceState
    });
});

app.delete("/api/attendance/day/:attendanceDate", (req, res) => {
    const date = req.params.attendanceDate;

    const index = attendanceState.attendanceDays.findIndex(d => d.attendanceDate === date);

    if (index === -1) {
        return res.json({ ok: false, error: "Attendance day not found" });
    }

    attendanceState.attendanceDays.splice(index, 1);

    res.json(successResponse());

    broadcast(wss, {
        eventType: "attendance-updated",
        changeType: "DELETED",
        changedDate: date,
        attendanceState
    });
});
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", ws => {
    ws.send(JSON.stringify({
        eventType: "attendance-initial",
        attendanceState
    }));
});

server.listen(5000, () => {
    console.log("Servidor en marxa a http://localhost:5000");
});
