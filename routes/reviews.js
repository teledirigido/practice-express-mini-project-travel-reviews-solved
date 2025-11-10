import express from 'express';
import db from '../db/connection.js';
import crypto from 'crypto';

const router = express.Router();

// GET / - Listar todas las reseñas
router.get('/', (req, res) => {
  res.render('reviews/list', { reviews: db.data.reviews });
});

// GET /new - Mostrar formulario para crear nueva reseña
router.get('/new', (req, res) => {
  res.render('reviews/new');
});

// POST / - Crear nueva reseña
router.post('/', req.app.locals.upload.single('image'), async (req, res) => {
  try {
    const { destination, title, comment, rating } = req.body;
    
    // Subir imagen a Cloudinary desde memoria
    const result = await req.app.locals.cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    );
    
    // Crear nueva reseña
    const newReview = {
      id: crypto.randomUUID(),
      destination,
      title,
      comment,
      rating,
      imageUrl: result.secure_url,
      imagePublicId: result.public_id
    };
    
    // Añadir a la base de datos
    db.data.reviews.push(newReview);
    await db.write();
    
    res.redirect('/reviews');
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).send('Error creating review');
  }
});

// GET /:id - Ver detalle de una reseña
router.get('/:id', (req, res) => {
  const review = db.data.reviews.find(r => r.id === req.params.id);
  if (!review) {
    return res.status(404).send('Review not found');
  }
  res.render('reviews/detail', { review });
});

// GET /:id/edit - Mostrar formulario para editar reseña
router.get('/:id/edit', (req, res) => {
  const review = db.data.reviews.find(r => r.id === req.params.id);
  if (!review) {
    return res.status(404).send('Review not found');
  }
  res.render('reviews/edit', { review });
});

// POST /:id - Actualizar reseña existente
router.post('/:id', req.app.locals.upload.single('image'), async (req, res) => {
  try {
    const { destination, title, comment, rating } = req.body;
    const reviewIndex = db.data.reviews.findIndex(r => r.id === req.params.id);
    
    if (reviewIndex === -1) {
      return res.status(404).send('Review not found');
    }
    
    const existingReview = db.data.reviews[reviewIndex];
    let imageUrl = existingReview.imageUrl;
    let imagePublicId = existingReview.imagePublicId;
    
    // Si hay nueva imagen, eliminar la antigua y subir la nueva
    if (req.file) {
      if (existingReview.imagePublicId) {
        await req.app.locals.cloudinary.uploader.destroy(existingReview.imagePublicId);
      }
      const result = await req.app.locals.cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      );
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }
    
    // Actualizar la reseña
    db.data.reviews[reviewIndex] = {
      ...existingReview,
      destination,
      title,
      comment,
      rating,
      imageUrl,
      imagePublicId
    };
    
    await db.write();
    res.redirect(`/reviews/${req.params.id}`);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).send('Error updating review');
  }
});

// POST /:id/delete - Eliminar reseña
router.post('/:id/delete', async (req, res) => {
  try {
    const reviewIndex = db.data.reviews.findIndex(r => r.id === req.params.id);
    
    if (reviewIndex === -1) {
      return res.status(404).send('Review not found');
    }
    
    const review = db.data.reviews[reviewIndex];
    
    // Eliminar imagen de Cloudinary si existe
    if (review.imagePublicId) {
      await req.app.locals.cloudinary.uploader.destroy(review.imagePublicId);
    }
    
    // Eliminar reseña de la base de datos
    db.data.reviews.splice(reviewIndex, 1);
    await db.write();
    
    res.redirect('/reviews');
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).send('Error deleting review');
  }
});

export default router;
