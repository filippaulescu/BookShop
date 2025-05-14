import { useEffect } from 'react';
import axios from 'axios';
import { useReducer } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Product from '../components/product';
import useSEO from '../hooks/useSEO';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Link } from 'react-router-dom';
import Rating from '../components/rating';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });

  useSEO({
    title: 'BookShop - Librăria Ta Online',
    description:
      'Descoperă cea mai largă colecție de cărți. Preturi accesibile, livrare rapidă.',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section bg-dark text-white py-5 mb-5 rounded">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Bun venit la BookShop</h1>
          <p className="lead">Descoperă lumea fascinantă a cărților</p>
          <div className="mt-4">
            <Badge bg="light" text="dark" className="mx-2 p-2">
              Livrare gratuită peste 100 RON
            </Badge>
            <Badge bg="light" text="dark" className="mx-2 p-2">
              {products.length} cărți disponibile
            </Badge>
            <Badge bg="light" text="dark" className="mx-2 p-2">
              Returnare în 30 de zile
            </Badge>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <h2 className="section-title text-center mb-4">
          Colecția Noastră
          <div className="title-underline mx-auto mt-2"></div>
        </h2>

        {loading ? (
          <div className="text-center py-5">
            <LoadingBox />
            <p className="mt-3 text-muted">Se încarcă produsele...</p>
          </div>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row className="g-4">
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-4">
                <Card
                  className="h-100 product-card shadow-sm border-0 transition"
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 10px rgba(0,0,0,0.1)';
                  }}
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className="d-block h-100 text-decoration-none"
                  >
                    <div
                      className="card-img-container"
                      style={{
                        height: '300px',
                        overflow: 'hidden',
                        position: 'relative',
                        background: 'linear-gradient(45deg, #f8f9fa, #e9ecef)',
                      }}
                    >
                      <Card.Img
                        variant="top"
                        src={product.image}
                        alt={product.name}
                        style={{
                          height: '100%',
                          width: '100%',
                          objectFit: 'contain',
                          transition: 'transform 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      />
                      {product.countInStock === 0 && (
                        <Badge
                          bg="danger"
                          className="position-absolute top-0 end-0 m-2"
                          style={{ fontSize: '0.7rem' }}
                        >
                          Epuizat
                        </Badge>
                      )}
                      {product.countInStock < 5 && product.countInStock > 0 && (
                        <Badge
                          bg="warning"
                          className="position-absolute top-0 end-0 m-2"
                          style={{ fontSize: '0.7rem' }}
                        >
                          Stoc limitat
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <Card.Body
                    className="d-flex flex-column"
                    style={{ minHeight: '200px' }}
                  >
                    <div className="flex-grow-1">
                      <Card.Title
                        className="text-truncate mb-2"
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#2c3e50',
                        }}
                        title={product.name}
                      >
                        <Link
                          to={`/product/${product.slug}`}
                          className="text-decoration-none"
                          style={{ color: '#2c3e50' }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = '#343a40')
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = '#2c3e50')
                          }
                        >
                          {product.name}
                        </Link>
                      </Card.Title>

                      <Card.Text
                        className="text-muted small mb-2"
                        style={{ fontStyle: 'italic' }}
                      >
                        <i className="bi bi-person me-1"></i>
                        {product.brand}
                      </Card.Text>

                      <div className="rating-container mb-2">
                        <Rating
                          rating={product.rating}
                          numReviews={product.numReviews}
                        />
                      </div>

                      <Card.Text
                        className="text-muted small mb-2"
                        style={{ lineHeight: '1.4' }}
                      >
                        {product.description && product.description.length > 100
                          ? product.description.substring(0, 100) + '...'
                          : product.description ||
                            'Descriere în curs de actualizare...'}
                      </Card.Text>
                    </div>

                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5
                          className="price-tag mb-0"
                          style={{
                            color: '#28a745',
                            fontWeight: 'bold',
                            fontSize: '1.3rem',
                          }}
                        >
                          ${product.price}
                        </h5>
                        <small className="text-muted">
                          {product.countInStock > 0
                            ? `${product.countInStock} în stoc`
                            : 'Indisponibil'}
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #343a40 0%, #495057 100%);
        }

        .section-title {
          font-weight: 700;
          color: #2c3e50;
          position: relative;
        }

        .title-underline {
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #343a40, #495057);
          border-radius: 2px;
        }

        .product-card {
          border-radius: 15px;
          overflow: hidden;
        }

        .product-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .price-tag {
          text-shadow: 1px 1px 2px rgba(40, 167, 69, 0.1);
        }

        .card-img-container:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            0deg,
            rgba(0, 0, 0, 0) 60%,
            rgba(0, 0, 0, 0.05) 100%
          );
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default HomeScreen;
