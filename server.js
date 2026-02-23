const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const SECRET_PASSWORD = "ktoNasral7"; // Ваш пароль

const app = express();
app.use(express.json());
app.use(express.static('public'));

let dataStore = {
  blocks: [
    { id: Date.now(), title: "Пилоты", coins: 1500, charts: [{ label: "Скорость", value: 4 }, { label: "Маневр", value: 5 }, { label: "Щиты", value: 2 }] },
    { id: Date.now()+1, title: "Инженеры с очень длинным названием", coins: 99, charts: [{ label: "Ремонт корпуса", value: 5 }, { label: "Починка орудий", value: 3 }, { label: "Энергосистемы", value: 4 }] }
  ],
  isCarouselActive: false 
};

function checkPassword(req, res, next) {
    const providedPassword = req.body.password || req.query.password;
    if (providedPassword === SECRET_PASSWORD) return next();
    res.status(403).send('Forbidden: Invalid Password');
}

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcastUpdate() {
  const message = JSON.stringify({ type: 'update' });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

app.get('/control.html', checkPassword, (req, res) => res.sendFile(path.join(__dirname, 'public', 'control.html')));
app.get('/data', (req, res) => res.json(dataStore));

app.post('/update', checkPassword, (req, res) => {
  dataStore = req.body.data;
  res.status(200).send({ message: 'Data saved.' });
});

app.post('/push', checkPassword, (req, res) => {
  broadcastUpdate();
  res.status(200).send({ message: 'Push command sent.' });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server is running on host ${HOST} port ${PORT}`);
  console.log(`Control Panel URL: http://ВАШ_IP:${PORT}/control.html?password=${SECRET_PASSWORD}`);
});