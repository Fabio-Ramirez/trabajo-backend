import express from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../meddlewares/validar-campo.js';
import { getUsuarios, registerUsuario } from '../controllers/usuarioControllers.js';

const router = express.Router();


// Ruta para obtener todos los ingresos

router.get('/users', getUsuarios);
router.post('/users', registerUsuario);



export default router;