import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { StoreContext } from '../contexts/Store';
import { getError } from '../utils';
import { Button, Table, Container, Badge } from 'react-bootstrap';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function AdminOrdersScreen() {
  const { state } = useContext(StoreContext);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/orders/admin/all`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };

    if (userInfo && userInfo.isAdmin) {
      fetchData();
    } else {
      navigate('/');
    }
  }, [userInfo, navigate]);

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
      <h1 className="my-3">Admin - All Orders</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <div>
          <div className="mb-3">
            <Badge bg="info" className="me-2">
              Total Orders: {orders.length}
            </Badge>
            <Badge bg="success" className="me-2">
              Paid Orders: {orders.filter((order) => order.isPaid).length}
            </Badge>
            <Badge bg="warning">
              Pending Payment: {orders.filter((order) => !order.isPaid).length}
            </Badge>
          </div>

          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Delivered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <code>{order._id.substring(0, 8)}...</code>
                  </td>
                  <td>{order.user ? order.user.name : 'Unknown'}</td>
                  <td>{order.user ? order.user.email : 'Unknown'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <strong>${order.totalPrice.toFixed(2)}</strong>
                  </td>
                  <td>
                    {order.isPaid ? (
                      <Badge bg="success">
                        Paid {new Date(order.paidAt).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge bg="danger">Not Paid</Badge>
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      <Badge bg="success">
                        Delivered{' '}
                        {new Date(order.deliveredAt).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge bg="warning">Not Delivered</Badge>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          navigate(`/order/${order._id}`);
                        }}
                      >
                        View Details
                      </Button>
                      {!order.isPaid && (
                        <Button
                          type="button"
                          variant="outline-warning"
                          size="sm"
                          onClick={async () => {
                            if (
                              window.confirm(
                                'Mark this order as paid? (FAKE PAYMENT)'
                              )
                            ) {
                              try {
                                await axios.put(
                                  `/api/orders/${order._id}/fakepay`,
                                  {},
                                  {
                                    headers: {
                                      Authorization: `Bearer ${userInfo.token}`,
                                    },
                                  }
                                );
                                window.location.reload(); // Reîncarcă pagina
                              } catch (error) {
                                alert('Error marking as paid');
                              }
                            }
                          }}
                        >
                          Fake Pay
                        </Button>
                      )}
                      {order.isPaid && !order.isDelivered && (
                        <Button
                          type="button"
                          variant="outline-success"
                          size="sm"
                          onClick={async () => {
                            if (
                              window.confirm('Mark this order as delivered?')
                            ) {
                              try {
                                await axios.put(
                                  `/api/orders/${order._id}/deliver`,
                                  {},
                                  {
                                    headers: {
                                      Authorization: `Bearer ${userInfo.token}`,
                                    },
                                  }
                                );
                                window.location.reload(); // Reîncarcă pagina
                              } catch (error) {
                                alert('Error marking as delivered');
                              }
                            }
                          }}
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}
