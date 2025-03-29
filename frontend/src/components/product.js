import { Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Rating from './rating'; // Asigură-te că numele fișierului este corect (case-sensitive)
import axios from 'axios';
import { useContext } from 'react';
import { StoreContext } from '../contexts/Store';

function Product(props) {
  const { product } = props;
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(StoreContext);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async () => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert(
        'Ne pare rău. Produsul nu este disponibil în cantitatea dorită'
      );
      return;
    }

    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    navigate('/cart');
  };

  return (
    <Card>
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>${product.price}</Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="light" disabled>
            Indisponibil
          </Button>
        ) : (
          <Button onClick={addToCartHandler}>Adaugă în coș</Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default Product;
