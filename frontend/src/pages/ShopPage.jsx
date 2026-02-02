import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { FaFilter, FaTh, FaList, FaSearch } from 'react-icons/fa';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = `${import.meta.env.VITE_API_URL}/api/products?keyword=${keyword}`;
        if (category !== 'All') {
          query += `&category=${category}`;
        }

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
  }, [keyword, category, sortBy]);

  const categories = ['All', 'Lifestyle', 'Basketball', 'Running', 'Sample Category'];

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
        
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full mb-4 py-3 px-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm flex items-center justify-between font-bold"
        >
          <span className="flex items-center gap-2"><FaFilter /> Filters & Sort</span>
          <span className="text-xs text-gray-500">{category !== 'All' ? category : 'All Categories'}</span>
        </button>

        {/* Filters Bar */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block mb-6 sm:mb-10`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setShowFilters(false); }}
                  className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider transition-all ${
                    category === cat 
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' 
                    : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort & View Options */}
            <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 flex-1 lg:flex-none">
                <FaFilter className="text-gray-400 hidden sm:block" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 lg:flex-none bg-gray-100 dark:bg-zinc-800 px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 ring-black dark:ring-white cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                >
                  <FaTh />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                >
                  <FaList />
                </button>
              </div>
            </div>
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
            <button 
              onClick={() => { setCategory('All'); }}
              className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold uppercase tracking-wider text-sm hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
              : "flex flex-col gap-4"
          }>
            {products.map((product, idx) => (
              <div 
                key={product._id} 
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