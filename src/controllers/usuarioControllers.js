import Usuario from '../models/usuarioModel.js';
import moment from 'moment';
import redis from 'redis';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
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
        const { id } = req.params;

        // Verificar si el ID proporcionado es válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de usuario no válido' });
        }

        // Buscar el usuario por ID en la base de datos
        const usuario = await Usuario.findById(id);

        // Verificar si el usuario existe
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            username: usuario.username,
            email: usuario.email,
            password: usuario.password,
            rol: usuario.rol,
            imagenUrl: usuario.imagenUrl
        });
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

        console.log("login user: ", usuario, " ingresos: ", req.body)
        // Si el usuario no existe o la contraseña es incorrecta
        if (!usuario || !bcrypt.compareSync(password, usuario.password)) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Genera el token JWT
        const token = jwt.sign({ id: usuario._id }, 'secreto', { expiresIn: '1h' });

        res.cookie("token", token, {
            httpOnly: process.env.NODE_ENV !== "development",
            secure: true,
            sameSite: "none",
        });

        res.header("Authorization", `JWT ${token}`);

        res.json({
            id: usuario._id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol,
            imagenUrl: usuario.imagenUrl,
            token: token
        });
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
        const { email, password, username, rol, imagenUrl } = req.body;

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
            rol,
            imagenUrl
        });

        await newUsuario.save();

        // Enviar una respuesta al cliente
        // Crear un token JWT y enviarlo junto con el mensaje de éxito
        const token = generateJWTToken(newUsuario); // Función para generar un token JWT

        res.cookie("token", token, {
            httpOnly: process.env.NODE_ENV !== "development",
            secure: true,
            sameSite: "none",
        });
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
        rol: user.rol,
        imagenUrl: user.imagenUrl
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

//Actualizar un usuario  
export const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, email, rol, imagenUrl } = req.body;

        console.log("user a la api: ", username, " id: ", id)

        // Verificar si el nuevo username ya existe en otro usuario
        const existingUser = await Usuario.findOne({ username });
        console.log("existe: ", existingUser)
        if (existingUser && existingUser._id.toString() !== id) {
            return res.status(400).json({ message: 'Ya existe un usuario con ese username.' });
        }

        // Preparar los datos actualizados
        const datosActualizados = { username, password, email, rol, imagenUrl };

        console.log("password a la api: ", password)
        // Si la contraseña se proporciona, hashea la nueva contraseña
        if (password !== '' && typeof password === 'string') {
            console.log("password a la api para cambiar: ", password)
            datosActualizados.password = await bcrypt.hash(password, 10);
        }

        // Actualizar el usuario
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            datosActualizados,
            { new: true } // Devuelve el usuario actualizado
        );

        if (!usuarioActualizado) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        // Enviar una respuesta al cliente
        res.status(200).json({ message: 'Usuario actualizado con éxito', usuario: usuarioActualizado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha ocurrido un error al registrar el usuario', error });
    }
};


