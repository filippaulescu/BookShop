import express from 'express';
import Product from '../models/productModel.js';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

// Ruta pentru găsire produs după slug (URL prietenos)
// Ruta pentru găsire produs după ID
productRouter.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.send(product);
    } else {
      res.status(404).send({ message: 'Produsul nu este disponibil' });
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).send({ message: 'Server error: ' + error.message });
  }
});

// Ruta pentru găsire produs după ID
/*
productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id); // Corectat findByID în findById
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Produsul nu este disponibil' });
  }
});
*/
productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Produsul nu este disponibil' });
  }
});

export default productRouter;
