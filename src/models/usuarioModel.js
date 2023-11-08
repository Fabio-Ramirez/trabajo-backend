import mongoose from 'mongoose';


const usuarioSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    rol: {
        type: String,
        required: false,
        enum: ['administrador', 'estandar'],
        default: 'estandar'
    }
}, {
    timestamps: true // Habilitar timestamps para createdAt y updatedAt
});

const Usuario = mongoose.model('Usuario', usuarioSchema);


export default Usuario;