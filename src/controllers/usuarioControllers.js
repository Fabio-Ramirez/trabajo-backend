import Usuario from '../models/usuarioModel.js';
import moment from 'moment';

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

//Registrar un usuario  
export const registerUsuario = async (req, res) => {
    try {
        const { username, password, email, dni, fechaRegistro, telefono } = req.body;

        // Crear un nuevo usuario
        console.log("usuario: ",req.body)
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
        res.status(500).json({ message: 'Ha ocurrido un error al registrar el usuario' });
    }
};
