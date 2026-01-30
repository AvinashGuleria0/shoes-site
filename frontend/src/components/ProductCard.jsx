import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toast } from 'react-toastify';
import { FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      
      {/* IMAGE CONTAINER */}
      <div className="relative h-64 bg-gray-100 dark:bg-black/50 overflow-hidden flex items-center justify-center">
        <Link to={`/product/${product._id}`}>
            <img 
              src={product.images?.side || product.image || 'https://via.placeholder.com/300'} 
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
            />
        </Link>
        
        {/* Quick Add Button */}
        <button 
            onClick={addToCartHandler}
            className="absolute bottom-4 right-4 bg-black text-white dark:bg-white dark:text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            title="Add to Cart"
        >
            <FaShoppingCart />
        </button>
      </div>

      {/* DETAILS */}
      <div className="p-6">
        <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{product.category || 'Sneakers'}</div>
        <Link to={`/product/${product._id}`}>
            <h3 className="text-xl font-black mb-2 hover:text-blue-500 transition-colors">{product.name}</h3>
        </Link>
        <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-bold">₹{product.price}</span>
            <span className={`text-xs px-2 py-1 rounded font-bold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.stock > 0 ? 'IN STOCK' : 'SOLD OUT'}
            </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
