// src/index.js
import app from "./app.js";
import connectDB from "./db.js";

// Conectarse a la base de datos de MongoDB
connectDB();

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Hola Dev: Servidor iniciado en el puerto ${PORT}`);
});
