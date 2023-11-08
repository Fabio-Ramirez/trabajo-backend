import jwt from 'jsonwebtoken';

export const verificarToken = async(req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    try {
        const usuario = jwt.verify(token, 'secreto');
        req.usuario = usuario;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Token inválido' });
    }
}

