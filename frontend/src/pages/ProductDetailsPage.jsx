import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0].size);
        }
        setLoading(false);
      } catch (error) {
        toast.error("Product not found");
        navigate('/shop');
      }
    };
    fetchProduct();
  }, [id, navigate]);

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

    dispatch(addToCart({ 
        ...product, 
        qty: 1, 
        size: selectedSize,
        countInStock: sizeData.quantity // Pass actual stock for this size
    }));
    toast.success(`added ${product.name} (Size: ${selectedSize}) to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
    });
  };

  const getStockForSize = (sizeName) => {
    return product.sizes.find(s => s.size === sizeName)?.quantity || 0;
  };

  if (loading) return <div className="pt-32 text-center font-bold uppercase tracking-widest animate-pulse">Loading kicks...</div>;

  return (
    <div className="pt-24 min-h-screen bg-white dark:bg-deep-void">
      <div className="container mx-auto px-6 py-12">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest hover:text-red-600 transition-colors"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* IMAGES */}
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-zinc-900 rounded-3xl p-8 aspect-square flex items-center justify-center overflow-hidden">
               <img 
                 src={product.images?.side?.startsWith('http') ? product.images.side : `${import.meta.env.VITE_API_URL}${product.images?.side}`} 
                 alt={product.name} 
                 className="w-full h-full object-contain hover:scale-110 transition-transform duration-500"
                 onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80' }}
               />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {['front', 'side', 'back'].map(angle => (
                    <div key={angle} className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-2 aspect-square flex items-center justify-center border border-transparent hover:border-red-500 cursor-pointer overflow-hidden">
                        <img 
                          src={product.images?.[angle]?.startsWith('http') ? product.images[angle] : `${import.meta.env.VITE_API_URL}${product.images?.[angle]}`} 
                          alt={angle} 
                          className="max-h-full object-contain"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80' }}
                        />
                    </div>
                ))}
            </div>
          </div>

          {/* INFO */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <span className="text-red-600 font-black uppercase tracking-[0.3em]">{product.category}</span>
                {selectedSize && getStockForSize(selectedSize) < 5 && getStockForSize(selectedSize) > 0 && (
                   <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-black animate-bounce">
                       ONLY {getStockForSize(selectedSize)} LEFT!
                   </span>
                )}
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 leading-none">{product.name}</h1>
            <p className="text-3xl font-bold mb-6">₹{product.price.toLocaleString()}</p>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
              {product.description}
            </p>

            <div className="flex flex-col gap-6 w-full max-w-sm">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-gray-400">Select Size (UK)</span>
                        {selectedSize && (
                           <span className="text-[10px] font-bold text-gray-500 italic">
                               {getStockForSize(selectedSize)} in stock
                           </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {product.sizes && product.sizes.length > 0 ? (
                            product.sizes.map((s, idx) => (
                                <button 
                                    key={idx} 
                                    disabled={s.quantity === 0}
                                    onClick={() => setSelectedSize(s.size)}
                                    className={`w-12 h-12 border font-bold transition-all flex items-center justify-center relative ${
                                        selectedSize === s.size 
                                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' 
                                        : 'border-gray-200 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                                    } ${s.quantity === 0 ? 'opacity-20 cursor-not-allowed' : ''}`}
                                >
                                    {s.size}
                                    {s.quantity === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-[1px] bg-red-600 rotate-45"></div>
                                        </div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-red-500 font-bold uppercase">Sold Out</p>
                        )}
                    </div>
                </div>

                <button 
                    onClick={addToCartHandler}
                    disabled={!product.sizes || product.sizes.every(s => s.quantity === 0)}
                    className={`w-full py-5 rounded-full font-black text-xl uppercase tracking-widest flex items-center justify-center gap-4 transition-all ${
                        product.sizes && product.sizes.some(s => s.quantity > 0)
                        ? 'bg-black text-white hover:bg-red-600 dark:bg-white dark:text-black dark:hover:bg-red-600 dark:hover:text-white transform active:scale-95' 
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                >
                    <FaShoppingCart /> {(product.sizes && product.sizes.some(s => s.quantity > 0)) ? (getStockForSize(selectedSize) === 0 ? 'Select Size' : 'Add to Cart') : 'Out of Stock'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;