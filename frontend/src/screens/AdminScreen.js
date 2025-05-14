import React, { useContext, useEffect, useReducer, useState } from 'react';
import { StoreContext } from '../contexts/Store';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    default:
      return state;
  }
};

export default function AdminScreen() {
  const { state: storeState } = useContext(StoreContext);
  const { userInfo } = storeState;

  const [{ loading, error, products, loadingCreate, loadingDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
      products: [],
      loadingCreate: false,
      loadingDelete: false,
    });

  // State pentru formularul de adăugare produs
  const [productData, setProductData] = useState({
    name: '',
    slug: '',
    price: '',
    countInStock: '',
    image: '/images/default-book.jpg',
    brand: 'Default Brand',
    category: 'Uncategorized',
  });

  // Încarcă lista de produse la încărcarea paginii
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchProducts();
  }, []);

  // Gestionează modificările în formular
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Generează automat slug-ul din nume
    if (name === 'name') {
      const autoSlug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setProductData((prev) => ({
        ...prev,
        slug: autoSlug,
      }));
    }
  };

  // Handling pentru adăugarea produsului
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !productData.name ||
      !productData.slug ||
      !productData.price ||
      !productData.countInStock
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.post('/api/products/admin', productData, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Product created successfully');

      // Reset formularul
      setProductData({
        name: '',
        slug: '',
        price: '',
        countInStock: '',
        image: '/images/default-book.jpg',
        brand: 'Default Brand',
        category: 'Uncategorized',
      });

      // Reîncarcă lista de produse
      const { data } = await axios.get('/api/products');
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  // Handling pentru ștergerea produsului
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/products/admin/${productId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'DELETE_SUCCESS' });
        toast.success('Product deleted successfully');

        // Reîncarcă lista de produse
        const { data } = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'DELETE_FAIL' });
        toast.error(getError(err));
      }
    }
  };

  // Verifică dacă utilizatorul este admin
  if (!userInfo || !userInfo.isAdmin) {
    return (
      <Container>
        <h1>Access Denied</h1>
        <p>You must be an admin to access this page.</p>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-3">Admin Panel - Product Management</h1>

      <Row>
        <Col md={6}>
          <h3>Add New Product</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="slug">
              <Form.Label>Slug (auto-generated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="product-slug"
                name="slug"
                value={productData.slug}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="price">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="countInStock">
              <Form.Label>Count in Stock</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter stock quantity"
                name="countInStock"
                value={productData.countInStock}
                onChange={handleInputChange}
                required
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="image">
              <Form.Label>Image Path</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter image path (e.g., /images/book.jpg)"
                name="image"
                value={productData.image}
                onChange={handleInputChange}
              />
              <Form.Text className="text-muted">
                Image should be placed in public/images/ folder. Example:
                /images/book.jpg
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="brand">
              <Form.Label>Brand (Author)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter author/brand"
                name="brand"
                value={productData.brand}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category"
                name="category"
                value={productData.category}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loadingCreate}>
              {loadingCreate ? 'Creating...' : 'Add Product'}
            </Button>
          </Form>
        </Col>

        <Col md={6}>
          <h3>Existing Products</h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                        }}
                      />
                    </td>
                    <td>${product.price}</td>
                    <td>{product.countInStock}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                        disabled={loadingDelete}
                      >
                        {loadingDelete ? 'Deleting...' : 'Delete'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
}
