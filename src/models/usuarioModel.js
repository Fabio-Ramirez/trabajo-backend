import mongoose from 'mongoose';


const usuarioSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true }, 
    email: { type: String, required: true, unique: true },
    dni: { type: Number, required: true, unique: true },
    fechaRegistro: { type: Object, required: false },
    telefono: { type: String, required: false }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);


export default Usuario;