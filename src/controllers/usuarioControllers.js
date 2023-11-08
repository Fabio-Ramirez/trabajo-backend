import Usuario from '../models/usuarioModel.js';
import moment from 'moment';
import redis from 'redis';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const client = redis.createClient({ url: "redis://31.187.76.251:6379" });

client.on('connect', () => {
    console.log('Conectado a Redis');
});

client.on('error', (err) => {
    console.log('Error en la conexión a Redis: ' + err);
});


//Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
    try {
        // Obtener todos los usuarios de la base de datos
        const usuarios = await Usuario.find();

        // Enviar una respuesta al cliente
        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha ocurrido un error al obtener los usuarios' });
    }
};

//Obtener un usuario
export const getUsuario = async (req, res) => {
    try {
        const { username } = req.params;
        // Obtener todos los usuarios de la base de datos
        const usuario = await Usuario.find({ username: username });

        // Enviar una respuesta al cliente
        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha ocurrido un error al obtener los usuarios' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca el usuario por email
        const usuario = await Usuario.findOne({ email });

        // Si el usuario no existe o la contraseña es incorrecta
        if (!usuario || !bcrypt.compareSync(password, usuario.password)) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Genera el token JWT
        const token = jwt.sign({ id: usuario._id }, 'secreto', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}

//Obtener todos los usuarios con redis
export const getUsuariosRedis = async (req, res) => {
    try {
        // Intentar obtener los resultados de Redis
        const cachedUsers = await client.get('fabioUser');

        if (cachedUsers) {
            console.log("Usando datos de la caché");
            return res.status(200).json({ data: JSON.parse(cachedUsers) });
        }

        // Si los resultados no están en caché, obtén los datos de la base de datos
        const response = await Usuario.find();

        // Almacena los resultados en Redis para futuras solicitudes
        await client.set('fabioUser', JSON.stringify(response));

        // Envía la respuesta al cliente
        return res.status(200).json({ data: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha ocurrido un error al obtener los usuarios' });
    }
};

//Registrar un usuario  
export const registerUsuario = async (req, res) => {
    try {
        const { email, password, username, rol } = req.body;

        // Crear un nuevo usuario
        console.log("usuario a registrar: ", req.body)


        const existeUsuario = await Usuario.findOne({ email })
        if (existeUsuario) {
            return res.status(400).json({ message: 'Ya existe un usuario con ese email' });
        }

        // hashing the password
        const passwordHash = await bcrypt.hash(password, 10);
        const newUsuario = new Usuario({
            email,
            password: passwordHash,
            username,
            rol
        });

        await newUsuario.save();

        // Enviar una respuesta al cliente
        // Crear un token JWT y enviarlo junto con el mensaje de éxito
        const token = generateJWTToken(newUsuario); // Función para generar un token JWT

        res.status(201).json({ message: 'Se ha creado con exito el registro del usuario: ' + token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha ocurrido un error al registrar el usuario', error });
    }
};

function generateJWTToken(user) {
    const payload = {
        id: user._id,  // ID del usuario en la base de datos
        email: user.email,  // Correo electrónico del usuario (u otros datos que desees incluir)
        username: user.username, // Nombre de usuario del usuario (u otros datos que desees incluir)
        rol: user.rol
    };

    // Firma del token con una clave secreta
    const secretKey = 'secreto'; // Reemplaza esto con una clave secreta segura
    const options = {
        expiresIn: '1h' // Tiempo de expiración del token (ejemplo: 1 hora)
    };

    // Generar el token JWT y devolverlo
    const token = jwt.sign(payload, secretKey, options);
    return token;
}
