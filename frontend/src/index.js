import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { StoreProvider } from './contexts/Store';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import SignupScreen from './screens/SignupScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen.js';
import PaymentMethodScreen from './screens/PaymentMethodScreen.js';
import PlaceOrderScreen from './screens/PlaceOrderScreen.js';
import OrderScreen from './screens/OrderScreen.js';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/UserProfileScreen.js';
import AdminScreen from './screens/AdminScreen';
import ErrorBoundary from './components/ErrorBoundary';
import AdminOrdersScreen from './screens/AdminOrdersScreen';

// Creează rutele
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'cart', element: <CartScreen /> },
      { path: 'signin', element: <SigninScreen /> },
      { path: 'cart/:id', element: <CartScreen /> },
      { path: 'product/:slug', element: <ProductScreen /> },
      { path: 'signup', element: <SignupScreen /> },
      { path: 'shipping', element: <ShippingAddressScreen /> },
      { path: 'payment', element: <PaymentMethodScreen /> },
      { path: 'placeorder', element: <PlaceOrderScreen /> },
      {
        path: 'profile',
        element: (
          <ErrorBoundary>
            <ProfileScreen />
          </ErrorBoundary>
        ),
      },
      { path: 'order/:id', element: <OrderScreen /> },
      { path: 'orderhistory', element: <OrderHistoryScreen /> },
      { path: 'admin', element: <AdminScreen /> },
      { path: 'admin/orders', element: <AdminOrdersScreen /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StoreProvider>
      <PayPalScriptProvider deferLoading={true}>
        <RouterProvider router={router} />
      </PayPalScriptProvider>
    </StoreProvider>
  </React.StrictMode>
);

reportWebVitals();
