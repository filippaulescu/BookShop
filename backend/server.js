import express from 'express';
import data from './data.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import Product from './models/productModel.js';
import User from './models/userModel.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

// Setup pentru ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectare MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectat la db'))
  .catch((err) => console.log(err.message));

const app = express();

// Middleware custom pentru CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Middleware pentru parsare JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Creează folderul pentru imagini dacă nu există
const imagesDir = path.join(__dirname, 'public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('Created images directory:', imagesDir);
}

// Servește fișierele statice - TREBUIE SĂ FIE ÎNAINTE DE RUTE
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// PayPal API Key
app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

// Rută temporară pentru reset
app.get('/api/reset', async (req, res) => {
  try {
    console.log('Resetting database...');
    const deletedProducts = await Product.deleteMany({});
    console.log('Products deleted:', deletedProducts.deletedCount);
    const deletedUsers = await User.deleteMany({});
    console.log('Users deleted:', deletedUsers.deletedCount);
    res.send(
      `Database cleared successfully. Deleted ${deletedProducts.deletedCount} products and ${deletedUsers.deletedCount} users.`
    );
  } catch (error) {
    console.error('Error deleting products/users:', error);
    res.status(500).send('Error clearing database: ' + error.message);
  }
});

// Rute API
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);

// Handler de erori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});

app.get('/api/fix-indexes', async (req, res) => {
  try {
    // Șterge colecțiile problematice
    await mongoose.connection.db.collection('users').drop();
    console.log('Users collection dropped');

    // Opțional: șterge și alte colecții pentru un fresh start
    await mongoose.connection.db
      .collection('products')
      .drop()
      .catch(() => {});
    await mongoose.connection.db
      .collection('orders')
      .drop()
      .catch(() => {});
    await mongoose.connection.db
      .collection('reviews')
      .drop()
      .catch(() => {});

    console.log('All collections reset');
    res.send({
      message: 'Database collections reset successfully. Run /api/seed next.',
    });
  } catch (error) {
    console.error('Error resetting collections:', error);
    res
      .status(500)
      .send({ message: 'Error resetting collections', error: error.message });
  }
});
