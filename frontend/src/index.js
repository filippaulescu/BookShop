import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import AppWrapper from './App';
import reportWebVitals from './reportWebVitals';
import { StoreProvider } from './contexts/Store';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>
);

reportWebVitals();
