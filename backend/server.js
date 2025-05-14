import express from 'express';
import data from './data.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
// Adaugă importurile pentru modelele de date
import Product from './models/productModel.js';
import User from './models/userModel.js';

dotenv.config();

// Conectare MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectat la db'))
  .catch((err) => console.log(err.message));

const app = express();

// Middleware custom pentru CORS (fără pachetul cors)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Middleware pentru parsare JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

// Rută temporară pentru reset - CORECTATĂ pentru Mongoose modern
app.get('/api/reset', async (req, res) => {
  try {
    console.log('Resetting database...');

    // Șterge produsele
    const deletedProducts = await Product.deleteMany({});
    console.log('Products deleted:', deletedProducts.deletedCount);

    // Șterge utilizatorii
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

// Rute
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
