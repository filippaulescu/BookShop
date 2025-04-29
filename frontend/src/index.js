import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import AppWrapper from './App';
import reportWebVitals from './reportWebVitals';
import { StoreProvider } from './contexts/Store';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <PayPalScriptProvider deferLoading={true}>
          <AppWrapper />
        </PayPalScriptProvider>
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>
);

reportWebVitals();
