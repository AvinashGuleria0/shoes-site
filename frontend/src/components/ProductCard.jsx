import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist) || { wishlistItems: [] };
  const isInWishlist = wishlistItems?.find(x => x._id === product._id);

  const addToCartHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart`);
  };

  const toggleWishlistHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.info('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist');
    }
  };

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300';
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  };

  // Calculate total stock from sizes
  const totalStock = product.sizes?.reduce((acc, s) => acc + (s.quantity || 0), 0) || product.stock || 0;

  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl overflow-hidden hover-lift border border-gray-100 dark:border-zinc-800">
      
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent"></div>
        </div>
        
        <Link to={`/product/${product._id}`} className="block w-full h-full">
          <img 
            src={getImageUrl(product.images?.side || product.image)} 
            alt={product.name}
            className="w-full h-full object-contain p-3 sm:p-6 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-500 drop-shadow-xl" 
          />
        </Link>
        
        {/* Floating Action Buttons - Always visible on mobile */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 transition-all duration-300">
          <button 
            onClick={toggleWishlistHandler}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 ${
              isInWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white'
            }`}
            title="Add to Wishlist"
          >
            <FaHeart size={12} className="sm:hidden" />
            <FaHeart size={14} className="hidden sm:block" />
          </button>
          <Link 
            to={`/product/${product._id}`}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 flex items-center justify-center shadow-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all transform hover:scale-110"
            title="Quick View"
          >
            <FaEye size={12} className="sm:hidden" />
            <FaEye size={14} className="hidden sm:block" />
          </Link>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
          <span className={`text-[8px] sm:text-[10px] font-black uppercase px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${
            totalStock === 0 
              ? 'bg-red-500 text-white' 
              : totalStock < 5 
                ? 'bg-yellow-500 text-black' 
                : 'bg-green-500 text-white'
          }`}>
            {totalStock === 0 ? 'Sold Out' : totalStock < 5 ? `${totalStock} left` : 'In Stock'}
          </span>
        </div>

        {/* Quick Add Button */}
        <button 
          onClick={addToCartHandler}
          disabled={totalStock === 0}
          className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 btn-ripple ${
            totalStock === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-black text-white dark:bg-white dark:text-black hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white'
          }`}
          title="Add to Cart"
        >
          <FaShoppingCart size={12} className="sm:hidden" />
          <FaShoppingCart size={14} className="hidden sm:block" />
          <span className="hidden sm:inline">Add to Cart</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* DETAILS */}
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-[8px] sm:text-[10px] font-bold text-red-500 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{product.category || 'Sneakers'}</span>
          
          {/* Color Swatches Placeholder - Hidden on very small screens */}
          <div className="hidden xs:flex gap-1">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-black border-2 border-gray-200"></span>
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 border-2 border-transparent hover:border-gray-400 cursor-pointer transition-all"></span>
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 border-2 border-transparent hover:border-gray-400 cursor-pointer transition-all"></span>
          </div>
        </div>
        
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm sm:text-lg font-black tracking-tight mb-1 hover:text-red-500 transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        
        <div className="flex justify-between items-center mt-2 sm:mt-3">
          <span className="text-base sm:text-xl font-black">₹{product.price?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
