import React, { useContext, useEffect, useReducer, useState } from 'react';
import { StoreContext } from '../contexts/Store';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getError } from '../utils';
import { Link } from 'react-router-dom';

// Reducer pentru gestionarea stării
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, users: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };
    case 'DELETE_RESET':
      return { ...state, successDelete: false };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    default:
      return state;
  }
};

export default function AdminUsersScreen() {
  const { state } = useContext(StoreContext);
  const { userInfo } = state;

  const [
    {
      loading,
      error,
      users,
      loadingUpdate,
      loadingDelete,
      successDelete,
      loadingCreate,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    users: [],
    loadingUpdate: false,
    loadingDelete: false,
    successDelete: false,
    loadingCreate: false,
  });

  // State pentru editarea utilizatorului
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    isAdmin: false,
  });
  const [resetPassword, setResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // State pentru adăugarea unui utilizator nou
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false,
  });

  // Încărcarea listei de utilizatori
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  // Deschide modal de editare utilizator
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditedUser({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
    setResetPassword(false);
    setNewPassword('');
    setEditUserModalVisible(true);
  };

  // Salvează modificările utilizatorului
  const handleSaveUser = async () => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });

      const updateData = {
        name: editedUser.name,
        email: editedUser.email,
        isAdmin: editedUser.isAdmin,
      };

      // Adaugă parola nouă dacă se resetează
      if (resetPassword && newPassword.trim()) {
        updateData.password = newPassword;
      }

      await axios.put(`/api/users/${selectedUser._id}`, updateData, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Utilizator actualizat cu succes');
      setEditUserModalVisible(false);

      // Reîncarcă lista de utilizatori
      const { data } = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL' });
      toast.error(getError(err));
    }
  };

  // Șterge utilizator
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'DELETE_SUCCESS' });
        toast.success('Utilizator șters cu succes');
      } catch (err) {
        dispatch({ type: 'DELETE_FAIL' });
        toast.error(getError(err));
      }
    }
  };

  // Comutare rapid status admin
  const toggleAdminStatus = async (user) => {
    const confirmMessage = user.isAdmin
      ? `Ești sigur că vrei să revoci drepturile de admin pentru ${user.name}?`
      : `Ești sigur că vrei să acorzi drepturi de admin pentru ${user.name}?`;

    if (window.confirm(confirmMessage)) {
      try {
        dispatch({ type: 'UPDATE_REQUEST' });

        await axios.put(
          `/api/users/${user._id}`,
          {
            name: user.name,
            email: user.email,
            isAdmin: !user.isAdmin,
          },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        dispatch({ type: 'UPDATE_SUCCESS' });
        toast.success(
          `Drepturile de admin au fost ${
            user.isAdmin ? 'revocate' : 'acordate'
          }`
        );

        // Reîncarcă lista de utilizatori
        const { data } = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'UPDATE_FAIL' });
        toast.error(getError(err));
      }
    }
  };

  // Funcție pentru a gestiona adăugarea unui utilizator nou
  const handleAddUser = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      // Validări simple
      if (
        !newUser.name.trim() ||
        !newUser.email.trim() ||
        !newUser.password.trim()
      ) {
        toast.error('Toate câmpurile sunt obligatorii');
        dispatch({ type: 'CREATE_FAIL' });
        return;
      }

      // Verificare email valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        toast.error('Adresa de email nu este validă');
        dispatch({ type: 'CREATE_FAIL' });
        return;
      }

      // Verifică lungimea parolei
      if (newUser.password.length < 6) {
        toast.error('Parola trebuie să aibă minim 6 caractere');
        dispatch({ type: 'CREATE_FAIL' });
        return;
      }

      // Creare utilizator nou
      const { data } = await axios.post(
        '/api/users/signup', // Folosim endpoint-ul existent de înregistrare
        newUser,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Utilizator creat cu succes');
      setShowAddUserModal(false);

      // Reset form
      setNewUser({
        name: '',
        email: '',
        password: '',
        isAdmin: false,
      });

      // Reîncarcă lista de utilizatori
      const { data: usersData } = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'FETCH_SUCCESS', payload: usersData });
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      if (
        err.response &&
        err.response.data.message &&
        err.response.data.message.includes('duplicate')
      ) {
        toast.error('Există deja un utilizator cu această adresă de email');
      } else {
        toast.error(getError(err));
      }
    }
  };

  // Verifică dacă utilizatorul este admin
  if (!userInfo || !userInfo.isAdmin) {
    return (
      <Container>
        <h1>Acces Interzis</h1>
        <p>Trebuie să fii administrator pentru a accesa această pagină.</p>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-3">Administrare Utilizatori</h1>

      {/* Butoane de navigare și adăugare */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex gap-2 flex-wrap justify-content-between">
            <div className="d-flex gap-2 flex-wrap">
              <Button
                as={Link}
                to="/admin"
                variant="outline-primary"
                className="mb-2"
              >
                <i className="bi bi-box me-2"></i>
                Gestionare Produse
              </Button>
              <Button
                as={Link}
                to="/admin/orders"
                variant="outline-primary"
                className="mb-2"
              >
                <i className="bi bi-list-check me-2"></i>
                Vizualizare Comenzi
              </Button>
              <Button
                variant="outline-secondary"
                className="mb-2"
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reîmprospătare
              </Button>
            </div>

            <Button
              variant="primary"
              className="mb-2"
              onClick={() => setShowAddUserModal(true)}
            >
              <i className="bi bi-person-plus me-2"></i>
              Adaugă Utilizator Nou
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistici utilizatori */}
      {!loading && !error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="info">
              <div className="d-flex gap-3 flex-wrap">
                <span>
                  <strong>Total Utilizatori:</strong> {users.length}
                </span>
                <span>
                  <strong>Administratori:</strong>{' '}
                  {users.filter((u) => u.isAdmin).length}
                </span>
                <span>
                  <strong>Utilizatori Obișnuiți:</strong>{' '}
                  {users.filter((u) => !u.isAdmin).length}
                </span>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Lista utilizatori */}
      {loading ? (
        <div>Se încarcă...</div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Creat La</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id.substring(0, 8)}...</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {user.isAdmin ? (
                    <Badge bg="success">Da</Badge>
                  ) : (
                    <Badge bg="secondary">Nu</Badge>
                  )}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <i className="bi bi-pencil me-1"></i> Editare
                    </Button>

                    {user._id !== userInfo._id && (
                      <>
                        <Button
                          variant={user.isAdmin ? 'warning' : 'success'}
                          size="sm"
                          onClick={() => toggleAdminStatus(user)}
                        >
                          {user.isAdmin ? (
                            <>
                              <i className="bi bi-person me-1"></i> Retrage
                              Admin
                            </>
                          ) : (
                            <>
                              <i className="bi bi-person-check me-1"></i> Fă
                              Admin
                            </>
                          )}
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={loadingDelete}
                        >
                          <i className="bi bi-trash me-1"></i> Șterge
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal editare utilizator */}
      <Modal
        show={editUserModalVisible}
        onHide={() => setEditUserModalVisible(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Editare Utilizator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nume</Form.Label>
                <Form.Control
                  type="text"
                  value={editedUser.name}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, name: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editedUser.email}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, email: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Administrator"
                  checked={editedUser.isAdmin}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, isAdmin: e.target.checked })
                  }
                />
              </Form.Group>

              <hr />

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Resetare Parolă"
                  checked={resetPassword}
                  onChange={(e) => {
                    setResetPassword(e.target.checked);
                    if (!e.target.checked) setNewPassword('');
                  }}
                />
              </Form.Group>

              {resetPassword && (
                <Form.Group className="mb-3">
                  <Form.Label>Parolă Nouă</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Introduceți parola nouă"
                  />
                  <Form.Text muted>
                    Lăsați gol pentru a păstra parola actuală
                  </Form.Text>
                </Form.Group>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setEditUserModalVisible(false)}
          >
            Anulare
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveUser}
            disabled={loadingUpdate}
          >
            {loadingUpdate ? 'Se salvează...' : 'Salvare'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal adăugare utilizator nou */}
      <Modal show={showAddUserModal} onHide={() => setShowAddUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adaugă Utilizator Nou</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nume</Form.Label>
              <Form.Control
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Parolă</Form.Label>
              <Form.Control
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
                placeholder="Minim 6 caractere"
              />
              <Form.Text className="text-muted">
                Parola trebuie să aibă minim 6 caractere.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Administrator"
                checked={newUser.isAdmin}
                onChange={(e) =>
                  setNewUser({ ...newUser, isAdmin: e.target.checked })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddUserModal(false)}
          >
            Anulare
          </Button>
          <Button
            variant="primary"
            onClick={handleAddUser}
            disabled={loadingCreate}
          >
            {loadingCreate ? 'Se creează...' : 'Creează Utilizator'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
