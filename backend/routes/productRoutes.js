import express from 'express';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../utils.js';

const productRouter = express.Router();

// Rutele existente rămân neschimbate
productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

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

productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Produsul nu este disponibil' });
  }
});

// RUTE NOI PENTRU ADMIN
// Crează un produs nou - doar pentru admin
productRouter.post('/admin', isAuth, isAdmin, async (req, res) => {
  try {
    const { name, slug, price, countInStock, image, brand, category } =
      req.body;

    // Verifică dacă slug-ul există deja
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).send({ message: 'Slug already exists' });
    }

    const product = new Product({
      name,
      slug,
      image: image || 'default-image.jpg',
      brand: brand || 'Default Brand',
      category: category || 'Uncategorized',
      price,
      countInStock,
      rating: 0,
      numReviews: 0,
    });

    const createdProduct = await product.save();
    res
      .status(201)
      .send({ message: 'Product Created', product: createdProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res
      .status(500)
      .send({ message: 'Error creating product: ' + error.message });
  }
});

// Șterge un produs - doar pentru admin
productRouter.delete('/admin/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.send({ message: 'Product Deleted' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res
      .status(500)
      .send({ message: 'Error deleting product: ' + error.message });
  }
});

export default productRouter;
