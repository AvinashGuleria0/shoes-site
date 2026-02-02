import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const wishlistFromStorage = localStorage.getItem('wishlist')
  ? JSON.parse(localStorage.getItem('wishlist'))
  : [];

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlistItems: wishlistFromStorage,
  },
  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload;
      const existItem = state.wishlistItems.find((x) => x._id === item._id);

      if (existItem) {
        toast.info('Already in your Wishlist!');
      } else {
        state.wishlistItems.push(item);
        localStorage.setItem('wishlist', JSON.stringify(state.wishlistItems));
        toast.success('Added to Wishlist');
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlistItems = state.wishlistItems.filter((x) => x._id !== action.payload);
      localStorage.setItem('wishlist', JSON.stringify(state.wishlistItems));
      toast.success('Removed from Wishlist');
    },
    clearWishlist: (state) => {
        state.wishlistItems = [];
        localStorage.removeItem('wishlist');
    }
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
