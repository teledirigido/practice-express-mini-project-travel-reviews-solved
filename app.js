import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import reviewsRouter from './routes/reviews.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Configurar archivos estáticos
app.use(express.static('public'));

// Configurar middleware para procesar formularios
app.use(express.urlencoded({ extended: true }));

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar multer para manejar archivos
// Usamos memoryStorage() para mantener los archivos en memoria
// en lugar de guardarlos en disco antes de subirlos a Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Hacer Cloudinary y multer disponibles en las rutas
app.locals.cloudinary = cloudinary;
app.locals.upload = upload;

// Importar y usar rutas de reviews
app.use('/reviews', reviewsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
