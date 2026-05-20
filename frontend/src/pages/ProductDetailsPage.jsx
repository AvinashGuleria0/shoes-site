import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { toast } from 'react-toastify';
import axios from 'axios';
import { SkeletonProductDetails } from '../components/Skeleton';
import { FaShoppingCart, FaArrowLeft, FaHeart, FaShippingFast, FaUndo, FaShieldAlt, FaMinus, FaPlus } from 'react-icons/fa';
import { gsap } from 'gsap';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('side');
  const [quantity, setQuantity] = useState(1);
  
  const imageRef = useRef(null);

  const { wishlistItems } = useSelector(state => state.wishlist) || { wishlistItems: [] };
  const isInWishlist = wishlistItems?.find(x => x._id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          // Auto-select first available size
          const firstAvailable = data.sizes.find(s => s.quantity > 0);
          if (firstAvailable) setSelectedSize(firstAvailable.size);
        }
        setLoading(false);
      } catch {
        toast.error("Product not found");
        navigate('/shop');
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // Animate image on change
  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(imageRef.current, 
        { opacity: 0, scale: 0.9, rotation: -5 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [selectedImage]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80';
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  };

  const addToCartHandler = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const sizeData = product.sizes.find(s => s.size === selectedSize);
    if (!sizeData || sizeData.quantity <= 0) {
      toast.error('This size is currently out of stock');
      return;
    }

    if (quantity > sizeData.quantity) {
      toast.error(`Only ${sizeData.quantity} available`);
      return;
    }

    dispatch(addToCart({ 
      ...product, 
      qty: quantity, 
      size: selectedSize,
      countInStock: sizeData.quantity
    }));
    toast.success(`Added ${product.name} to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const toggleWishlistHandler = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.info('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist!');
    }
  };

  const getStockForSize = (sizeName) => {
    return product?.sizes?.find(s => s.size === sizeName)?.quantity || 0;
  };

  const totalStock = product?.sizes?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0;

  if (loading) {
    return (
      <div className="pt-16 sm:pt-20 min-h-screen bg-white dark:bg-deep-void transition-colors duration-300">
        <SkeletonProductDetails />
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-20 min-h-screen bg-white dark:bg-deep-void transition-colors duration-300">
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 dark:bg-zinc-900 py-3 sm:py-4 px-4 sm:px-6">
        <div className="container mx-auto flex items-center gap-2 text-xs sm:text-sm overflow-x-auto">
          <Link to="/" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors whitespace-nowrap">Home</Link>
          <span className="text-gray-400">/</span>
          <Link to="/shop" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors whitespace-nowrap">Shop</Link>
          <span className="text-gray-400">/</span>
          <span className="font-bold truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6 sm:mb-8 text-xs sm:text-sm font-bold uppercase tracking-widest hover:text-red-600 transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-20">
          
          {/* IMAGES SECTION */}
          <div className="space-y-4 sm:space-y-6">
            {/* Main Image */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 aspect-square flex items-center justify-center overflow-hidden">
              
              {/* Wishlist Button */}
              <button 
                onClick={toggleWishlistHandler}
                className={`absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-lg transition-all transform hover:scale-110 z-10 ${
                  isInWishlist 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white dark:bg-zinc-700 text-gray-400 hover:text-red-500'
                }`}
              >
                <FaHeart />
              </button>

              {/* Stock Badge */}
              {totalStock < 10 && totalStock > 0 && (
                <span className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase animate-pulse">
                  Low Stock
                </span>
              )}
              
              <img 
                ref={imageRef}
                src={getImageUrl(product.images?.[selectedImage])} 
                alt={product.name} 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {['front', 'side', 'back'].map(angle => (
                <button 
                  key={angle} 
                  onClick={() => setSelectedImage(angle)}
                  className={`bg-gray-100 dark:bg-zinc-800 rounded-xl sm:rounded-2xl p-2 sm:p-4 aspect-square flex items-center justify-center transition-all hover-lift ${
                    selectedImage === angle 
                      ? 'ring-2 ring-black dark:ring-white ring-offset-2' 
                      : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-zinc-600'
                  }`}
                >
                  <img 
                    src={getImageUrl(product.images?.[angle])} 
                    alt={angle} 
                    className="max-h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col">
            
            {/* Category & Stock */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="text-red-500 font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-xs sm:text-sm">{product.category}</span>
              <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full ${
                totalStock === 0 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {totalStock === 0 ? 'Out of Stock' : `${totalStock} in stock`}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-3 sm:mb-4 leading-none">{product.name}</h1>
            
            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-4xl font-black">₹{product.price?.toLocaleString()}</span>
              <span className="text-base sm:text-xl text-gray-400 line-through">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
              <span className="text-green-600 font-bold text-xs sm:text-sm bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">20% OFF</span>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg leading-relaxed mb-6 sm:mb-8">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <span className="text-xs sm:text-sm font-bold uppercase text-gray-500 tracking-wider">Select Size (UK)</span>
                {selectedSize && (
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    {getStockForSize(selectedSize)} available
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((s, idx) => (
                    <button 
                      key={idx} 
                      disabled={s.quantity === 0}
                      onClick={() => setSelectedSize(s.size)}
                      className={`w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all relative overflow-hidden ${
                        selectedSize === s.size 
                          ? 'bg-black text-white dark:bg-white dark:text-black ring-2 ring-offset-2 ring-black dark:ring-white' 
                          : 'bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700'
                      } ${s.quantity === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      {s.size}
                      {s.quantity === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[2px] bg-red-500 rotate-45"></div>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-red-500 font-bold uppercase text-sm">Currently unavailable</p>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6 sm:mb-8">
              <span className="text-xs sm:text-sm font-bold uppercase text-gray-500 tracking-wider mb-2 sm:mb-3 block">Quantity</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg sm:rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <FaMinus size={10} />
                  </button>
                  <span className="w-10 sm:w-12 text-center font-bold text-sm sm:text-base">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(getStockForSize(selectedSize) || 10, quantity + 1))}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <FaPlus size={10} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={addToCartHandler}
              disabled={totalStock === 0 || !selectedSize}
              className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl uppercase tracking-wider flex items-center justify-center gap-3 sm:gap-4 transition-all mb-6 btn-ripple ${
                totalStock > 0 && selectedSize
                  ? 'bg-black text-white hover:bg-red-600 dark:bg-white dark:text-black dark:hover:bg-red-600 dark:hover:text-white transform active:scale-[0.98]' 
                  : 'bg-gray-200 dark:bg-zinc-800 cursor-not-allowed text-gray-400'
              }`}
            >
              <FaShoppingCart /> 
              {totalStock === 0 ? 'Out of Stock' : !selectedSize ? 'Select a Size' : 'Add to Cart'}
            </button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-zinc-800">
              {[
                { icon: <FaShippingFast />, text: 'Free Shipping' },
                { icon: <FaUndo />, text: '30-Day Returns' },
                { icon: <FaShieldAlt />, text: 'Authentic' },
              ].map((feature, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-red-500 text-base sm:text-xl mb-1 sm:mb-2 flex justify-center">{feature.icon}</div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;