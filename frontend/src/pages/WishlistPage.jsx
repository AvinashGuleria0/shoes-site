import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { removeFromWishlist } from '../store/wishlistSlice';

const WishlistPage = () => {
    const { wishlistItems } = useSelector((state) => state.wishlist);
    const dispatch = useDispatch();

    const removeItemHandler = (id) => {
        dispatch(removeFromWishlist(id));
    };

    return (
        <div className="pt-20 sm:pt-24 pb-12 sm:pb-20 min-h-screen bg-white dark:bg-deep-void text-gray-900 dark:text-white transition-colors">
            <div className="container mx-auto px-4 sm:px-6">
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-6 sm:mb-8">My Wishlist <span className="text-red-600">({wishlistItems.length})</span></h1>

                {wishlistItems.length === 0 ? (
                    <div className="text-center py-12 sm:py-20 bg-gray-50 dark:bg-zinc-900 rounded-xl sm:rounded-2xl px-4">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4">Your wishlist is empty</h2>
                        <Link to="/shop" className="inline-block bg-black text-white dark:bg-white dark:text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-80 transition-opacity">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                        {wishlistItems.map((item) => (
                            <div key={item._id} className="group relative bg-gray-50 dark:bg-zinc-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all hover:-translate-y-1 hover:shadow-xl dark:hover:bg-zinc-800">
                                <Link to={`/product/${item._id}`}>
                                    <div className="h-32 sm:h-48 w-full flex items-center justify-center mb-3 sm:mb-4 overflow-hidden rounded-lg sm:rounded-xl bg-white dark:bg-black/50">
                                         <img 
                                            src={item.images?.side?.startsWith('http') ? item.images.side : `${import.meta.env.VITE_API_URL}${item.images?.side}`} 
                                            alt={item.name} 
                                            className="h-24 sm:h-32 object-contain group-hover:scale-110 transition-transform duration-500" 
                                        />
                                    </div>
                                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide truncate">{item.name}</h3>
                                    <p className="text-gray-500 text-[10px] sm:text-xs mb-1 sm:mb-2">{item.category}</p>
                                    <p className="font-black text-base sm:text-lg">₹{item.price}</p>
                                </Link>

                                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-2">
                                    <button 
                                        onClick={() => removeItemHandler(item._id)}
                                        className="bg-white text-red-500 p-1.5 sm:p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                                        title="Remove"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                                <div className="mt-3 sm:mt-4">
                                     <Link to={`/product/${item._id}`} className="block w-full text-center bg-black text-white dark:bg-white dark:text-black py-2 rounded-lg font-bold text-[10px] sm:text-xs uppercase hover:opacity-80">
                                        View Product
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;