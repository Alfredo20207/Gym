require('dotenv').config();
const session = require('express-session');

const express = require('express');
const db = require('./db');

const app = express();
const PORT = 3000;
const argon2 = require('argon2');
// Permite recibir datos en formato JSON.
app.use(express.json());

app.use(session({
    name : 'gym.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, //impide que el JS del navegador la lea
        secure: false, // nos deja usar el localhost
        maxAge: 1000 * 60 * 60
    }
}));

// Comprobar que el servidor funciona.
app.get('/api/health', (req, res) => {
    res.json({
        mensaje: 'API del gimnasio funcionando'
    });
});

// Información del gimnasio.
app.get('/api/gimnasio', async (req, res) => {
    try {
        const [gimnasio] = await db.execute(
            `SELECT nombre, descripcion, direccion,
                    telefono, correo_contacto
             FROM gimnasio
             WHERE id = 1`
        );

        res.json(gimnasio);
    } catch (error) {
        console.error('Error al consultar el gimnasio:', error);

        res.status(500).json({
            mensaje: 'No se pudo cargar la información del gimnasio'
        });
    }
});

// Servicios disponibles.
app.get('/api/servicios', async (req, res) => {
    try {
        const [servicios] = await db.execute(
            `SELECT id, nombre, descripcion
             FROM servicios
             WHERE activo = 1
             ORDER BY orden`
        );

        res.json(servicios);
    } catch (error) {
        console.error('Error al consultar servicios:', error);

        res.status(500).json({
            mensaje: 'No se pudieron cargar los servicios'
        });
    }
});

// Planes informativos.
app.get('/api/planes', async (req, res) => {
    try {
        const [planes] = await db.execute(
            `SELECT id, nombre, precio_mxn_centavos,
                    duracion_dias, beneficios
             FROM planes
             WHERE activo = 1
             ORDER BY orden`
        );

        res.json(planes);
    } catch (error) {
        console.error('Error al consultar planes:', error);

        res.status(500).json({
            mensaje: 'No se pudieron cargar los planes'
        });
    }
});

// Horarios del gimnasio.
app.get('/api/horarios', async (req, res) => {
    try {
        const [horarios] = await db.execute(
            `SELECT dia_semana, abre, cierra, cerrado
             FROM horarios
             ORDER BY dia_semana`
        );

        res.json(horarios);
    } catch (error) {
        console.error('Error al consultar horarios:', error);

        res.status(500).json({
            mensaje: 'No se pudieron cargar los horarios'
        });
    }
});

// Validación del registro. Todavía no guarda usuarios.
app.post('/api/registro', async (req, res) => {
    const { nombre, correo, password } = req.body ?? {};

    // Comprobar que los campos sean textos con contenido.
    if (
        typeof nombre !== 'string' || !nombre.trim() ||
        typeof correo !== 'string' || !correo.trim() ||
        typeof password !== 'string' || !password.trim()
    ) {
        return res.status(400).json({
            mensaje: 'Nombre, correo y contraseña son obligatorios'
        });
    }

    // Preparar y validar el correo.
    const correoLimpio = correo.trim().toLowerCase(); //trim para eliminar espacios al inicio y final, toLowerCase para que no haya problemas con mayúsculas y minúsculas
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correoLimpio)) {
        return res.status(400).json({
            mensaje: 'El correo no tiene un formato válido'
        });
    }

    // Comprobar la longitud de la contraseña.
    if (password.length < 12) {
        return res.status(400).json({
            mensaje: 'La contraseña debe tener al menos 12 caracteres'
        });
    }

    let conexion;

try {
    const [usuarios] = await db.execute(
        'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
        [correoLimpio]
    );

    if (usuarios.length > 0) {
        return res.status(409).json({
            mensaje: 'El correo ya está registrado'
        });
    }

    const passwordHash = await argon2.hash(password);

    // Usar la misma conexión para ambas operaciones.
    conexion = await db.getConnection();
    await conexion.beginTransaction();

    // Crear el usuario.
    const [resultado] = await conexion.execute(
        `INSERT INTO usuarios (nombre, correo, password_hash, rol)
         VALUES (?, ?, ?, ?)`,
        [nombre.trim(), correoLimpio, passwordHash, 'usuario']
    );

    // Crear su perfil usando el ID del usuario recién creado.
    await conexion.execute(
        'INSERT INTO perfiles (usuario_id) VALUES (?)',
        [resultado.insertId]
    );

    // Confirmar ambas operaciones.
    await conexion.commit();

    res.status(201).json({
        mensaje: 'Usuario y perfil registrados correctamente',
        usuario: {
            id: resultado.insertId,
            nombre: nombre.trim(),
            correo: correoLimpio,
            rol: 'usuario'
        }
    });
} catch (error) {
    if (conexion) {
        try {
            await conexion.rollback();
        } catch (errorRollback) {
            console.error('Error al deshacer el registro:', errorRollback);
        }
    }

    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            mensaje: 'El correo ya está registrado'
        });
    }

    console.error('Error al registrar usuario:', error);

    res.status(500).json({
        mensaje: 'No se pudo registrar el usuario'
    });
    } finally {
    if (conexion) {
        conexion.release();
    }
}
});

app.post('/api/login', async (req, res) => {
    const { correo, password } = req.body ?? {};

    if (
        typeof correo !== 'string' || !correo.trim() ||
        typeof password !== 'string' || !password.trim()
    ) {
        return res.status(400).json({
            mensaje: 'Correo y contraseña son obligatorios'
        });
    }

    const correoLimpio = correo.trim().toLowerCase();

    try {
        const [usuarios] = await db.execute(
            `SELECT id, nombre, correo, password_hash, rol
             FROM usuarios
             WHERE correo = ? AND activo = 1
             LIMIT 1`,
            [correoLimpio]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        const usuario = usuarios[0];

        const coincide = await argon2.verify(
            usuario.password_hash,
            password
        );

        if (!coincide) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        req.session.usiario = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        };

        res.json({
            mensaje: 'Credenciales correctas',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('Error al comprobar el login:', error);

        res.status(500).json({
            mensaje: 'No se pudo procesar el login'
        });
    }
});

//para comprobar si el login dejo una session activa
app.get('/api/session', (req, res) => {
   if(!req.session.usuario){
    return res.status(401).json({
        mensaje: 'No hay sesión activa'
    });
   }

   res.json({
    mensaje: 'Sesión activa',
    usuario: req.session.usuario
   });
});


// Iniciar el servidor.
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});