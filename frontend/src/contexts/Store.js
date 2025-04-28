// src/contexts/Store.js
import { createContext, useReducer } from 'react';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
  cart: {
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {},
    paymentMethod: localStorage.getItem('paymentMethod') || '',
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'CART_ADD_ITEM': {
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item._id === existItem._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case 'CART_REMOVE_ITEM': {
      const filteredItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem('cartItems', JSON.stringify(filteredItems));
      return { ...state, cart: { ...state.cart, cartItems: filteredItems } };
    }

    case 'CART_CLEAR':
      return { ...state, cart: { ...state.cart, cartItems: [] } };

    case 'USER_SIGNIN':
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
      return { ...state, userInfo: action.payload };

    case 'USER_SIGNOUT':
      localStorage.removeItem('userInfo');
      localStorage.removeItem('shippingAddress');
      return {
        ...state,
        userInfo: null,
        cart: { ...state.cart, shippingAddress: {} },
      };

    case 'SAVE_SHIPPING_ADDRESS':
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
      return {
        ...state,
        cart: { ...state.cart, shippingAddress: action.payload },
      };

    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };

    default:
      return state;
  }
}

export const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}
