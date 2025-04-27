import { Button, Container, Form } from 'react-bootstrap';
import useSEO from '../hooks/useSEO';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { useContext, useState } from 'react';
import { StoreContext } from '../contexts/Store';

export default function SigninScreen() {
  useSEO({
    title: 'Autentificare - BookShop',
    description: 'Pagina de autentificare în BookShop',
  });

  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Pentru afișarea erorilor în UI

  const { state, dispatch: ctxDispatch } = useContext(StoreContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // Folosește URL RELATIV (fără localhost:5000)
      const { data } = await Axios.post('/api/users/signin', {
        email,
        password,
      });
      ctxDispatch({ type: 'USER_SIGING', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Autentificare eșuată');
    }
  };

  return (
    <Container className="small-container">
      <h1 className="my-3">Autentificare</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Parola</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Autentificare</Button>
        </div>
        <div className="mb-3">
          Client nou?{' '}
          <Link to={`/signup?redirect=${redirect}`}>Creează cont</Link>
        </div>
      </Form>
    </Container>
  );
}
