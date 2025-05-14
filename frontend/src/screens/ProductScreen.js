import axios from 'axios';
import { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  ListGroup,
  Row,
  Col,
  Badge,
  Form,
  Alert,
  Modal,
} from 'react-bootstrap';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { StoreContext } from '../contexts/Store';
import Rating from '../components/rating';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDeleteReview: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDeleteReview: false };
    case 'DELETE_FAIL':
      return { ...state, loadingDeleteReview: false };
    default:
      return state;
  }
};

// Componenta pentru afișarea stelelor interactive
function StarRating({ rating, onRatingChange, interactive = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  const styles = {
    starRating: {
      display: 'inline-flex',
      fontSize: '1.5rem',
      color: '#ddd',
    },
    star: {
      cursor: interactive ? 'pointer' : 'default',
      color: '#ddd',
    },
    starFilled: {
      color: '#ffc107',
    },
    starHover: {
      color: '#ff8c00',
    },
  };

  return (
    <div style={styles.starRating}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            ...styles.star,
            ...((hoverRating || rating) >= star ? styles.starFilled : {}),
            ...(interactive && hoverRating === star ? styles.starHover : {}),
          }}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ProductScreen() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [
    { loading, error, product, loadingCreateReview, loadingDeleteReview },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    product: null,
    loadingCreateReview: false,
    loadingDeleteReview: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(StoreContext);
  const { cart, userInfo } = state;

  // States pentru review form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        // Obține produsul cu recenziile
        const { data } = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      toast.warning(
        'Ne pare rău. Produsul nu este disponibil în cantitatea dorită'
      );
      return;
    }

    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    toast.success('Produs adăugat în coș!');
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Vă rugăm să selectați un rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Vă rugăm să scrieți o recenzie');
      return;
    }

    try {
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'CREATE_SUCCESS' });

      // Reîncarcă produsul pentru a afișa noua recenzie
      const { data } = await axios.get(`/api/products/slug/${slug}`);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });

      setRating(0);
      setComment('');
      setShowReviewForm(false);
      toast.success('Recenzia a fost adăugată cu succes!');
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  const deleteReviewHandler = async (reviewId) => {
    if (window.confirm('Sigur doriți să ștergeți această recenzie?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/products/${product._id}/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'DELETE_SUCCESS' });

        // Reîncarcă produsul pentru a afișa actualizările
        const { data } = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });

        toast.success('Recenzia a fost ștearsă cu succes!');
      } catch (err) {
        dispatch({ type: 'DELETE_FAIL' });
        toast.error(getError(err));
      }
    }
  };

  if (loading) return <LoadingBox />;
  if (error) return <MessageBox variant="danger">{error}</MessageBox>;
  if (!product)
    return <MessageBox variant="info">Produsul nu a fost găsit</MessageBox>;

  return (
    <div>
      {/* Secțiunea principală a produsului */}
      <Row className="mb-5">
        <Col md={8}>
          <img
            className="img-fluid rounded shadow"
            src={product.image}
            alt={product.name}
            style={{
              width: '80%',
              minHeight: '300px',
              maxHeight: '500px',
              objectFit: 'contain',
              backgroundColor: '#f8f9fa',
            }}
          />
        </Col>
        <Col md={4}>
          <Row>
            <Col xl={12}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h1 className="text-primary">{product.name}</h1>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-flex align-items-center">
                    <Rating
                      rating={product.rating}
                      numReviews={product.numReviews}
                    />
                    <small className="text-muted ms-2">
                      ({product.numReviews}{' '}
                      {product.numReviews === 1 ? 'recenzie' : 'recenzii'})
                    </small>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h4 className="text-success">Preț: ${product.price}</h4>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Descriere:</strong>
                  <p className="mt-2 text-muted">{product.description}</p>
                </ListGroup.Item>
                <ListGroup.Item>
                  <small className="text-muted">
                    <strong>Autor:</strong> {product.brand}
                  </small>
                </ListGroup.Item>
                <ListGroup.Item>
                  <small className="text-muted">
                    <strong>Categorie:</strong> {product.category}
                  </small>
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col xl={12}>
              <Card className="shadow-sm">
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col>Preț:</Col>
                        <Col>
                          <strong>${product.price}</strong>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Status:</Col>
                        <Col>
                          {product.countInStock > 0 ? (
                            <Badge bg="success">Disponibil</Badge>
                          ) : (
                            <Badge bg="danger">Indisponibil</Badge>
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    {product.countInStock > 0 && (
                      <ListGroup.Item>
                        <div className="d-grid">
                          <Button
                            onClick={addToCartHandler}
                            variant="primary"
                            size="lg"
                          >
                            Adaugă în coș
                          </Button>
                        </div>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Secțiunea de recenzii */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h3 className="mb-0">Recenzii clienți</h3>
            </Card.Header>
            <Card.Body>
              {product.reviews && product.reviews.length === 0 && (
                <MessageBox>Nu există recenzii încă</MessageBox>
              )}

              {/* Formular pentru recenzie nouă */}
              {userInfo ? (
                <div className="mb-4">
                  {!showReviewForm ? (
                    <Button
                      variant="outline-primary"
                      onClick={() => setShowReviewForm(true)}
                      className="mb-3"
                    >
                      Scrie o recenzie
                    </Button>
                  ) : (
                    <Card className="border-primary">
                      <Card.Header className="bg-primary text-white">
                        <h5 className="mb-0">Scrie o recenzie</h5>
                      </Card.Header>
                      <Card.Body>
                        <Form onSubmit={submitHandler}>
                          <Form.Group className="mb-3">
                            <Form.Label>Rating</Form.Label>
                            <div>
                              <StarRating
                                rating={rating}
                                onRatingChange={setRating}
                                interactive={true}
                              />
                            </div>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Recenzia ta</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Scrie părerea ta despre acest produs..."
                            />
                          </Form.Group>
                          <div className="d-flex gap-2">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={loadingCreateReview}
                            >
                              {loadingCreateReview
                                ? 'Se trimit...'
                                : 'Trimite recenzia'}
                            </Button>
                            <Button
                              variant="outline-secondary"
                              onClick={() => {
                                setShowReviewForm(false);
                                setRating(0);
                                setComment('');
                              }}
                            >
                              Anulează
                            </Button>
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              ) : (
                <Alert variant="info" className="mb-4">
                  Vă rugăm să <strong>vă autentificați</strong> pentru a scrie o
                  recenzie.
                </Alert>
              )}

              {/* Lista recenziilor existente */}
              {product.reviews && product.reviews.length > 0 && (
                <div>
                  <h5 className="mb-3">
                    Toate recenziile ({product.reviews.length})
                  </h5>
                  {product.reviews.map((review) => (
                    <Card key={review._id} className="mb-3">
                      <Card.Body>
                        <Row>
                          <Col>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{review.name}</h6>
                                <div className="mb-2">
                                  <StarRating rating={review.rating} />
                                  <small className="text-muted ms-2">
                                    {new Date(
                                      review.createdAt
                                    ).toLocaleDateString('ro-RO')}
                                  </small>
                                </div>
                                <p className="text-muted mb-0">
                                  {review.comment}
                                </p>
                              </div>
                              {userInfo &&
                                (userInfo._id === review.user ||
                                  userInfo.isAdmin) && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() =>
                                      deleteReviewHandler(review._id)
                                    }
                                    disabled={loadingDeleteReview}
                                  >
                                    {loadingDeleteReview
                                      ? 'Se șterge...'
                                      : 'Șterge'}
                                  </Button>
                                )}
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ProductScreen;
