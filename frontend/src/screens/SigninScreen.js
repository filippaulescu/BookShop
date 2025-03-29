import { Button, Container, Form } from 'react-bootstrap';
import useSEO from '../hooks/useSEO';
import { Link, useLocation } from 'react-router-dom';

export default function SigninScreen() {
  useSEO({
    title: 'Autentificare - BookShop',
    description: 'Pagina de autentificare în BookShop',
  });
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';
  return (
    <Container className="small-container">
      <h1 className="my-3">Autentificare</h1>
      <Form>
        <Form.Group className="mb-3" controlID="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" required />
        </Form.Group>
        <Form.Group className="mb-3" controlID="password">
          <Form.Label>Parola</Form.Label>
          <Form.Control type="password" required />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Autentificare</Button>
        </div>
        <div className="mb-3">
          Client nou?{' '}
          <Link to={`/signup?redirect=${redirect}`}>Creeaza cont</Link>
        </div>
      </Form>
    </Container>
  );
}
