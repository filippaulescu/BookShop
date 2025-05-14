import { Link, Outlet } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { Badge, Nav, NavDropdown } from 'react-bootstrap';
import { useContext, useEffect } from 'react';
import { StoreContext } from './contexts/Store';

export default function App() {
  const { state, dispatch } = useContext(StoreContext);
  const { cart, userInfo } = state;

  // Calculate cart items count
  const cartItemsCount = cart.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      dispatch({ type: 'USER_SIGNIN', payload: JSON.parse(storedUser) });
    }
  }, [dispatch]);

  const signoutHandler = () => {
    dispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    window.location.href = '/';
  };

  return (
    <div className="d-flex flex-column site-container">
      <header>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">
              BookShop
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto w-100 justify-content-end">
                <Link to="/cart" className="nav-link">
                  Cart
                  {cart.cartItems.length > 0 && (
                    <Badge pill bg="danger">
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
                    {/* Link pentru admin - doar pentru administratori */}
                    {userInfo.isAdmin && (
                      <NavDropdown.Item as={Link} to="/admin">
                        Admin Panel
                      </NavDropdown.Item>
                    )}
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
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
      <main>
        <Container className="mt-3">
          <Outlet /> {/* Înlocuiește Routes și toate Route cu Outlet */}
        </Container>
      </main>
      <footer>
        <div className="text-center">By Filip Paulescu</div>
      </footer>
    </div>
  );
}
