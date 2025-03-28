import { Routes, Route, Link } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { Badge, Nav } from 'react-bootstrap';
import { useContext } from 'react';
import { Store } from './screens/Store';

function App() {
  const { state } = useContext(Store);
  const { cart } = state;

  // Calculează suma totală a cantităților din coș
  const cartItemsCount = cart.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="d-flex flex-column site-container">
      <header>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand as={Link} to="/">
              BookShop
            </Navbar.Brand>
            <Nav className="me-auto">
              <Link
                to="/cart"
                className="nav-link"
                style={{ position: 'relative' }}
              >
                Coş
                {cartItemsCount > 0 && (
                  <Badge
                    pill
                    bg="danger"
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                  </Badge>
                )}
              </Link>
            </Nav>
          </Container>
        </Navbar>
      </header>
      <main>
        <Container className="mt-3">
          <Routes>
            <Route path="/product/:slug" element={<ProductScreen />} />
            <Route path="/" element={<HomeScreen />} />
          </Routes>
        </Container>
      </main>
      <footer>
        <div className="text-center"> By Filip Paulescu </div>
      </footer>
    </div>
  );
}

export default App;
