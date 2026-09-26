const express = require('express');

const app = express();
const PORT = 3000;

app.get('/api/health', (req, res) => {
  res.json({ mensaje: 'API del gimnasio funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});