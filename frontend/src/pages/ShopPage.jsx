import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { FaSearch } from 'react-icons/fa';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = `${import.meta.env.VITE_API_URL}/api/products?keyword=${keyword}`;
        const { data } = await axios.get(query);
        
        // Sort products
        let sortedData = [...data];
        if (sortBy === 'price-low') {
          sortedData.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          sortedData.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name') {
          sortedData.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        setProducts(sortedData);
        setLoading(false);
      } catch {
        console.error("Failed to fetch products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, sortBy]);

  return (
    <div className="pt-16 sm:pt-20 min-h-screen bg-gray-50 dark:bg-deep-void transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-black via-zinc-900 to-black text-white py-10 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 sm:mb-4">
            {keyword ? (
              <>Results for "<span className="text-red-500">{keyword}</span>"</>
            ) : (
              <>Shop <span className="text-red-500">Collection</span></>
            )}
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg max-w-xl">
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Sort Options */}
        <div className="mb-6 sm:mb-10">
          <div className="flex justify-end items-center p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-100 dark:bg-zinc-800 px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 ring-black dark:ring-white cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <span className="font-bold uppercase tracking-widest text-gray-500 animate-pulse text-sm">Loading kicks...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <FaSearch className="text-2xl sm:text-3xl text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black mb-2">No products found</h2>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              {keyword ? `No results for "${keyword}". Try a different search term.` : 'No products in this category.'}
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product, idx) => (
              <div 
                key={product._id || idx} 
                className="animate-slide-in-up"
                style={{ animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;