const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json()); //permite leer el JSON del body de las peticiones
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
        const [planes] = await db.execute(
            'SELECT id, nombre, precio_mxn_centavos, duracion_dias, beneficios FROM planes WHERE activo= 1 order by orden'
        );

        res.json(planes);
    } catch (error) {
        console.error('Error al consultar planes:', error);
        res.status(500).json({ mensaje: 'No se pudieron cargar los planes' });
    }
});

app.get('/api/horarios', async (req,res) => {
    try{
        const [horarios] = await db.execute(
            'SELECT dia_semana, abre, cierra, cerrado FROM horarios ORDER BY dia_semana'
        );
        res.json(horarios);
    } catch (error) {
        console.error('Error al consultar horarios:', error);
        res.status(500).json({ mensaje: 'No se pudieron cargar los horarios' });
    }
});

app.get('/api/gimnasio', async (req,res) => {
    try{
        const [gimnasio] = await db.execute(
            'SELECT id, nombre, descripcion, direccion, telefono, correo_contacto FROM gimnasio'
        );
        res.json(gimnasio);
    } catch (error) {
        console.error('Error al consultar gimnasio:', error);
        res.status(500).json({ mensaje: 'No se pudo cargar la información del gimnasio' });
    }
});

app.post('/api/registro', (req, res) => {
  const { nombre, correo, password } = req.body ?? {};

  if (
    typeof nombre !== 'string' || !nombre.trim() ||
    typeof correo !== 'string' || !correo.trim() ||
    typeof password !== 'string' || !password.trim()
  ) {
    return res.status(400).json({
      mensaje: 'Nombre, correo y contraseña son obligatorios'
    });
  }

  const correoLimpio = correo.trim().toLowerCase();// trim elimina espacion al inicio y final, toLowerCase convierte a minusculas

  const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //validacion de correo electronico
  if (!formatoCorreo.test(correoLimpio)) { //test comprueba el formato del correo 
    return res.status(400).json({ //return detiene la funcion si el formato es incorrecto
      mensaje: 'El correo electrónico no tiene un formato válido'
    });
  }


  if (password.length < 12) { //validacion de password
    return res.status(400).json({
        mensaje: 'La contraseña debe tener al menos 12 caracteres'
    });
    }
  res.json({ mensaje: 'Datos recibidos correctamente' });
});


app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});