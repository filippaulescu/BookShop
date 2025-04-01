import express from 'express';
import Product from '../models/productModel.js';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

// Ruta pentru găsire produs după slug (URL prietenos)
productRouter.get('/slug/:slug', async (req, res) => {
  // Schimbat din :slugon în :slug
  const product = await Product.findOne({ slug: req.params.slug }); // Adăugat {} și corectat parametrul
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Produsul nu este disponibil' });
  }
});

// Ruta pentru găsire produs după ID
productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id); // Corectat findByID în findById
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Produsul nu este disponibil' });
  }
});

export default productRouter;
