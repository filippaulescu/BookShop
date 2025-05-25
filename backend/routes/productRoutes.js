import express from 'express';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../utils.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Review from '../models/reviewModel.js';
import Order from '../models/orderModel.js'; // Adaugă acest import

const productRouter = express.Router();

// Setup pentru ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurează multer pentru upload-uri
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/images');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// UPLOAD ROUTE
productRouter.post(
  '/upload',
  isAuth,
  isAdmin,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    const imagePath = `/images/${req.file.filename}`;
    res.send({
      message: 'Image uploaded successfully',
      imagePath: imagePath,
    });
  }
);

// ADMIN ROUTES
productRouter.post('/admin', isAuth, isAdmin, async (req, res) => {
  try {
    const { name, slug, price, countInStock, image, brand, category } =
      req.body;

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).send({ message: 'Slug already exists' });
    }

    const product = new Product({
      name,
      slug,
      image: image || '/images/default-book.jpg',
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

productRouter.put('/admin/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }

    if (updates.name !== undefined) product.name = updates.name;
    if (updates.slug !== undefined) {
      if (updates.slug !== product.slug) {
        const existingProduct = await Product.findOne({ slug: updates.slug });
        if (existingProduct) {
          return res.status(400).send({ message: 'Slug already exists' });
        }
      }
      product.slug = updates.slug;
    }
    if (updates.price !== undefined) product.price = updates.price;
    if (updates.countInStock !== undefined)
      product.countInStock = updates.countInStock;
    if (updates.image !== undefined) product.image = updates.image;
    if (updates.brand !== undefined) product.brand = updates.brand;
    if (updates.category !== undefined) product.category = updates.category;

    product.updatedAt = new Date();
    const updatedProduct = await product.save();
    res.send({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res
      .status(500)
      .send({ message: 'Error updating product: ' + error.message });
  }
});

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

// REVIEW ROUTES - Trebuie să fie înaintea rutelor generice
productRouter.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.send(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res
      .status(500)
      .send({ message: 'Error fetching reviews: ' + error.message });
  }
});

productRouter.post('/:id/reviews', isAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;

    // Verifică dacă produsul există
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }

    // Validări simple
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .send({ message: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length < 5) {
      return res
        .status(400)
        .send({ message: 'Comment must be at least 5 characters long' });
    }

    // Creează recenzia (fără verificarea existenței)
    const review = new Review({
      user: userId,
      product: productId,
      name: req.user.name,
      rating: parseInt(rating),
      comment: comment.trim(),
    });

    await review.save();

    // Actualizează rating-ul produsului
    await product.updateRating();

    res.status(201).send({
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).send({ message: 'Error adding review: ' + error.message });
  }
});

productRouter.delete('/:id/reviews/:reviewId', isAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).send({ message: 'Review not found' });
    }

    // Verifică permisiunile
    if (
      review.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .send({ message: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    // Actualizează rating-ul produsului
    const product = await Product.findById(req.params.id);
    await product.updateRating();

    res.send({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res
      .status(500)
      .send({ message: 'Error deleting review: ' + error.message });
  }
});

// GENERAL ROUTES - După rutele specifice
productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

productRouter.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (product) {
      // Obține și recenziile pentru acest produs
      const reviews = await Review.find({ product: product._id })
        .populate('user', 'name')
        .sort({ createdAt: -1 });

      res.send({
        ...product.toJSON(),
        reviews,
      });
    } else {
      res.status(404).send({ message: 'Produsul nu este disponibil' });
    }
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).send({ message: 'Server error: ' + error.message });
  }
});

// Această rută trebuie să fie ULTIMA
productRouter.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      // Obține și recenziile pentru acest produs
      const reviews = await Review.find({ product: req.params.id })
        .populate('user', 'name')
        .sort({ createdAt: -1 });

      res.send({
        ...product.toJSON(),
        reviews,
      });
    } else {
      res.status(404).send({ message: 'Produsul nu este disponibil' });
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).send({ message: 'Server error: ' + error.message });
  }
});

export default productRouter;
