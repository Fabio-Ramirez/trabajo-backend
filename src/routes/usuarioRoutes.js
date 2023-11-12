import express from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../meddlewares/validar-campo.js';
import { verificarToken } from '../meddlewares/protected.js'
import { getUsuarios, getUsuario, registerUsuario, getUsuariosRedis, login } from '../controllers/usuarioControllers.js';
import { getPublicaciones, registerPublicacion } from '../controllers/publicacionControllers.js';

const router = express.Router();

// Rutas
router.get('/users', getUsuarios);
router.get('/user/:id', getUsuario);
router.get('/usersRedis', getUsuariosRedis);
router.get('/rutaProtegida', verificarToken, (req, res) => {
    // Esta ruta está protegida y solo es accesible con un token válido
    res.json({ message: 'Acceso permitido' });
});

router.post('/users', registerUsuario);
router.post('/auth', login);

router.get('/publicaciones', getPublicaciones);
router.post('/publicaciones', registerPublicacion);



export default router;