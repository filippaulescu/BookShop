import express from 'express';
import data from './data.js';

const app = express();

app.get('/api/products', (req, res) => {
  res.send(data.products);
});

// Ruta pentru găsire produs după slug (URL prietenos)
app.get('/api/products/slug/:slug', (req, res) => {
  const product = data.products.find((x) => x.slug === req.params.slug);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Produsul nu este disponibil' });
  }
});

// Ruta pentru găsire produs după ID
app.get('/api/products/:id', (req, res) => {
  const product = data.products.find((x) => x._id === req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Produsul nu este disponibil' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server rulează la http://localhost:${port}`);
});
