import express from 'express';
import responseTime from 'response-time';
import cors from 'cors';
import routeUsuario from './routes/usuarioRoutes.js';
/*import routeEstudiante from './routes/routeEstudiante.js';
import profesorRoutes from './routes/routeProfesor.js';*/

const app = express();

// Configurar middlewares
app.use(express.json());
app.use(responseTime());

// Habilitar CORS
app.use(cors());

// Configurar rutas
app.use('/comercio', routeUsuario);

export default app 