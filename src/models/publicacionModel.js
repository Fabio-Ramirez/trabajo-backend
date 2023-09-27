import mongoose from 'mongoose';


const publicacionSchema = new mongoose.Schema({
    descripcion: { type: String, required: true, unique: true },//dato como clave y requerido
    fecha: { type: Object, required: true },// dato requerido
    imagen: { type: String, required: false },
    hora: { type: String, required: false},
    ubicacion: { type: String, required: false }
});

const Publicacion = mongoose.model('Publicacion', publicacionSchema);


export default Publicacion;