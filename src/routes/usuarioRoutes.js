import express from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../meddlewares/validar-campo.js';
import { getUsuarios, registerUsuario } from '../controllers/usuarioControllers.js';
import { getPublicaciones, registerPublicacion } from '../controllers/publicacionControllers.js';

const router = express.Router();


// Rutas

router.get('/users', getUsuarios);
router.post('/users', registerUsuario);

router.get('/publicaciones', getPublicaciones);
router.post('/publicaciones', registerPublicacion);



export default router;