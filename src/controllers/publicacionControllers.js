import Publicacion from '../models/publicacionModel.js';
import Usuario from '../models/usuarioModel.js';
import moment from 'moment';

//Obtener todos los publicacions
export const getPublicaciones = async (req, res) => {
    try {
        // Obtener todos los Publicaciones de la base de datos
        const publicaciones = await Publicacion.find();

        // Enviar una respuesta al cliente
        res.status(200).json(publicaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha ocurrido un error al obtener los publicaciones' });
    }
};

//Registrar un publicacion  
export const registerPublicacion = async (req, res) => {
    try {
        const { usuario, descripcion, fecha, imagen, hora, ubicacion } = req.body;

        // Buscar el usuario por su ID
        const usuarioBuscado = await Usuario.findOne({ username: usuario });

        if (!usuarioBuscado) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Crear un nuevo publicacion
        //console.log("usuarioBuscado: ",usuarioBuscado)
        const newPublicacion = new Publicacion({ descripcion, fecha, imagen, hora, ubicacion });

        const existePublicacionEnUsuario = await usuarioBuscado.publicaciones.find( publicacion => publicacion.nombrePublicacion === descripcion )
        if (existePublicacionEnUsuario) {
            return res.status(400).json({ message: 'Ya existe esa publicacion en el usuario' });
        }

        //Se arma el objeto para insertarlo en la bd de Usuario
        const publicacionEnUsuario = { nombrePublicacion: newPublicacion.descripcion }
        usuarioBuscado.publicaciones.push(publicacionEnUsuario);
        await usuarioBuscado.save();
        await newPublicacion.save();

        // Enviar una respuesta al cliente
        res.status(201).json({ message: 'Se ha creado con exito el registro del publicacion: ', newPublicacion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha ocurrido un error al registrar el publicacion' });
    }
};
