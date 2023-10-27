import Usuario from '../models/usuarioModel.js';
import moment from 'moment';
import redis from 'redis';
import axios from 'axios';
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
        const { username, password, email, dni, fechaRegistro, telefono } = req.body;

        // Crear un nuevo usuario
        console.log("usuario: ", req.body)
        const newUsuario = new Usuario({ username, password, email, dni, fechaRegistro, telefono });

        const existeUsuario = await Usuario.findOne({ username: username })
        if (existeUsuario) {
            return res.status(400).json({ message: 'Ya existe ese usuario' });
        }

        await newUsuario.save();

        // Enviar una respuesta al cliente
        res.status(201).json({ message: 'Se ha creado con exito el registro del usuario: ', newUsuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha ocurrido un error al registrar el usuario', error });
    }
};
