import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
  shippingAddress: localStorage.getItem('shippingAddress') ? JSON.parse(localStorage.getItem('shippingAddress')) : {},
  paymentMethod: localStorage.getItem('paymentMethod') || 'Razorpay',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      // Unique item key = product ID + size
      const existItem = state.cartItems.find((x) => x._id === item._id && x.size === item.size);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) => (x._id === existItem._id && x.size === existItem.size) ? item : x);
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      // For removal, we need to match both ID and Size if size exists
      const itemToRemove = action.payload; // Assuming payload can be an object {id, size} or just id
      if (typeof itemToRemove === 'object') {
          state.cartItems = state.cartItems.filter((x) => !(x._id === itemToRemove._id && x.size === itemToRemove.size));
      } else {
          state.cartItems = state.cartItems.filter((x) => x._id !== itemToRemove);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', action.payload);
    }
  },
});

export const { addToCart, removeFromCart, saveShippingAddress, savePaymentMethod } = cartSlice.actions;
export default cartSlice.reducer;
