import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { Badge, Nav, NavDropdown } from 'react-bootstrap';
import { useContext, useEffect } from 'react';
import { StoreContext } from './contexts/Store'; // Changed from Store to StoreContext
import CartScreen from './screens/CartScreen';
import { StoreProvider } from './contexts/Store'; // Add StoreProvider import
import SigninScreen from './screens/SigninScreen';
import { LinkContainer } from 'react-router-bootstrap';
import SignupScreen from './screens/SignupScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen.js';
import PaymentMethodScreen from './screens/PaymentMethodScreen.js';
import PlaceOrderScreen from './screens/PlaceOrderScreen.js';

function AppWrapper() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}

function App() {
  const { state, dispatch } = useContext(StoreContext);
  const { cart, userInfo } = state;

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      dispatch({ type: 'USER_SIGNIN', payload: JSON.parse(storedUser) });
    }
  }, [dispatch]);

  const cartItemsCount = cart.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const signoutHandler = () => {
    dispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
  };

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
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>
              {userInfo ? (
                <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">
                    User Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orderhistory">
                    Order History
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <Link
                    className="dropdown-item"
                    to="#signout"
                    onClick={signoutHandler}
                  >
                    Sign Out
                  </Link>
                </NavDropdown>
              ) : (
                <Link className="nav-link" to="/signin">
                  Sign In
                </Link>
              )}
            </Nav>
          </Container>
        </Navbar>
      </header>
      <main>
        <Container className="mt-3">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/signin" element={<SigninScreen />} />
            <Route path="/cart/:id" element={<CartScreen />} />
            <Route path="/product/:slug" element={<ProductScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/shipping" element={<ShippingAddressScreen />} />
            <Route path="/payment" element={<PaymentMethodScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
          </Routes>
        </Container>
      </main>
      <footer>
        <div className="text-center"> By Filip Paulescu </div>
      </footer>
    </div>
  );
}

export default AppWrapper; // Export AppWrapper instead of App
