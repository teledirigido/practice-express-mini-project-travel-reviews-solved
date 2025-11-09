import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// TODO: Configurar express-handlebars
// TODO: Configurar archivos estáticos (public)
// TODO: Configurar middleware para procesar formularios (express.urlencoded)
// TODO: Configurar Cloudinary
// TODO: Configurar multer para subida de archivos
// TODO: Importar y usar rutas de reviews

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
