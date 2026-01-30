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
    <div className="pt-24 px-6 md:px-20 min-h-screen bg-gray-50 dark:bg-deep-void text-gray-800 dark:text-white">
      <h1 className="text-4xl font-black uppercase mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl mb-4">Your cart is empty</h2>
          <Link to="/" className="text-blue-500 underline">Go Back Home</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">
          {/* CART ITEMS */}
          <div className="flex-1 space-y-6">
            {cartItems.map((item) => (
              <div key={`${item._id}-${item.size}`} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.images?.side?.startsWith('http') ? item.images.side : `${import.meta.env.VITE_API_URL}${item.images?.side}`} 
                    alt={item.name} 
                    className="w-20 h-20 object-contain rounded"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' }}
                  />
                  <div>
                    <Link to={`/product/${item._id}`} className="font-bold text-lg hover:underline">{item.name}</Link>
                    <p className="text-sm text-gray-500">Price: ₹{item.price}</p>
                    <p className="text-xs font-bold text-red-500 uppercase">Size: {item.size || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <select 
                      className="p-2 border rounded dark:bg-black dark:border-gray-700 font-bold"
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
                  
                  <button onClick={() => removeFromCartHandler(item)} className="text-red-500 hover:text-red-700 transition-colors">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="lg:w-1/3 h-fit bg-white dark:bg-white/5 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Items</span>
              <span>{cartItems.reduce((acc, item) => acc + item.qty, 0)}</span>
            </div>
            <div className="flex justify-between mb-6 text-xl font-bold">
              <span>Total</span>
              <span>₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
            </div>
            <button 
              onClick={checkoutHandler}
              disabled={cartItems.length === 0}
              className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
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
