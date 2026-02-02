import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, addToCart } from '../store/cartSlice';
import { FaTrash } from 'react-icons/fa';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const removeFromCartHandler = (item) => {
    dispatch(removeFromCart({ _id: item._id, size: item.size }));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  return (
    <div className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-20 min-h-screen bg-gray-50 dark:bg-deep-void text-gray-800 dark:text-white pb-8">
      <h1 className="text-2xl sm:text-4xl font-black uppercase mb-6 sm:mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 sm:py-20 bg-white dark:bg-zinc-900 rounded-2xl">
          <h2 className="text-xl sm:text-2xl mb-4 font-bold">Your cart is empty</h2>
          <Link to="/" className="inline-block px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold uppercase tracking-wider text-sm hover:opacity-80 transition-opacity">Go Back Home</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">
          {/* CART ITEMS */}
          <div className="flex-1 space-y-4 sm:space-y-6">
            {cartItems.map((item) => (
              <div key={`${item._id}-${item.size}`} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-lg shadow-sm gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <img 
                    src={item.images?.side?.startsWith('http') ? item.images.side : `${import.meta.env.VITE_API_URL}${item.images?.side}`} 
                    alt={item.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded bg-gray-50 dark:bg-zinc-800 p-1"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' }}
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item._id}`} className="font-bold text-sm sm:text-lg hover:underline block truncate">{item.name}</Link>
                    <p className="text-xs sm:text-sm text-gray-500">₹{item.price}</p>
                    <p className="text-[10px] sm:text-xs font-bold text-red-500 uppercase">Size: {item.size || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <select 
                      className="p-2 border rounded dark:bg-black dark:border-gray-700 font-bold text-sm"
                      value={item.qty}
                      onChange={(e) => dispatch(addToCart({ ...item, qty: Number(e.target.value) }))}
                    >
                      {[...Array(item.countInStock || 1).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </select>
                    {item.countInStock <= 5 && (
                      <span className="text-[10px] text-red-500 font-bold mt-1 uppercase">Only {item.countInStock} Left</span>
                    )}
                  </div>
                  
                  <button onClick={() => removeFromCartHandler(item)} className="text-red-500 hover:text-red-700 transition-colors p-2">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="lg:w-1/3 h-fit bg-white dark:bg-white/5 p-5 sm:p-6 rounded-xl sm:rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Summary</h2>
            <div className="flex justify-between mb-2 text-sm sm:text-base">
              <span>Items</span>
              <span>{cartItems.reduce((acc, item) => acc + item.qty, 0)}</span>
            </div>
            <div className="flex justify-between mb-6 text-lg sm:text-xl font-bold">
              <span>Total</span>
              <span>₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
            </div>
            <button 
              onClick={checkoutHandler}
              disabled={cartItems.length === 0}
              className="w-full py-3 sm:py-4 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm sm:text-base rounded-xl hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all disabled:opacity-50"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
