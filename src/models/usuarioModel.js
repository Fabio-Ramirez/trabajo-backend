import mongoose from 'mongoose';


const usuarioSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },//dato como clave y requerido
    password: { type: String, required: true, unique: true },//dato como clave y requerido
    email: { type: String, required: true, unique: true },//dato como clave y requerido
    dni: { type: Number, required: true, unique: true },
    fechaRegistro: { type: Object, required: false },
    telefono: { type: String, required: false },
    publicaciones: [
        {
            nombrePublicacion: { type: String, required: false }
        }
    ]
});

const Usuario = mongoose.model('Usuario', usuarioSchema);


export default Usuario;