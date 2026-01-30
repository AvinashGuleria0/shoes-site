import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', 'Lifestyle', 'Basketball', 'Running'];
  const filteredProducts = category === 'All' 
    ? products 
    : products.filter(p => p.category === category);

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-deep-void transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">
        
        {/* HEADER & FILTER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-5xl font-black uppercase tracking-tighter">
            Full Collection <span className="text-red-600">({filteredProducts.length})</span>
          </h1>
          
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest transition-all ${
                  category === cat 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'bg-white text-black border border-gray-200 hover:border-black dark:bg-zinc-800 dark:text-white dark:border-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-500">No products found in this category.</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;