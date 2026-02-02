import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../store/cartSlice';

const ShippingPage = () => {
    const cart = useSelector((state) => state.cart);
    const { shippingAddress } = cart;
  
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || 'India');
  
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    const submitHandler = (e) => {
      e.preventDefault();
      dispatch(saveShippingAddress({ address, city, postalCode, country }));
      navigate('/payment');
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-deep-void pt-20 px-4 py-8">
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-xl sm:rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Shipping</h1>
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">Address</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">City</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">Postal Code</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">Country</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white dark:bg-white dark:text-black font-bold py-3 sm:py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShippingPage;
