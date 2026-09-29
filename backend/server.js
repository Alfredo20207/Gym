const express = require('express');
const db = require('./db');

const app = express();
const PORT = 3000;

app.get('/api/health', (req, res) => {
  res.json({ mensaje: 'API del gimnasio funcionando' });
});

app.get('/api/servicios', async (req, res) => {
  try {
    const [servicios] = await db.execute(
      'SELECT id, nombre, descripcion FROM servicios WHERE activo = 1 ORDER BY orden'
    );

    res.json(servicios);
  } catch (error) {
    console.error('Error al consultar servicios:', error);
    res.status(500).json({ mensaje: 'No se pudieron cargar los servicios' });
  }
});

app.get('/api/planes', async (req, res) => {
    try {
        CONST [planes] = await db.execute(
            'SELECT id, nombre, precio_mxn_centavos, duracion_dias, beneficios FROM planes WHERE activo= 1'
        );

        res.json(planes);
    } catch (error) {
        console.error('Error al consultar planes:', error);
        res.status(500).json({ mensaje: 'No se pudieron cargar los planes' });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});