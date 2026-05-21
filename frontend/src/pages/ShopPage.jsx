import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { SkeletonProductCard } from '../components/Skeleton';
import { FaSearch, FaFilter, FaTimes, FaTimesCircle, FaChevronDown, FaCheck } from 'react-icons/fa';

const ShopPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  // Filter States
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [maxPriceLimit, setMaxPriceLimit] = useState(50000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = `${import.meta.env.VITE_API_URL}/api/products?keyword=${keyword}`;
        const { data } = await axios.get(query);
        
        setAllProducts(data);
        setFilteredProducts(data);

        // Dynamically find maximum price for slider limit
        if (data.length > 0) {
          const maxPrice = Math.max(...data.map(p => p.price));
          setPriceRange({ min: 0, max: maxPrice });
          setMaxPriceLimit(maxPrice);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword]);

  // Extract unique filter keys from loaded products
  const categories = ['All', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
  const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
  const colors = [...new Set(allProducts.map(p => p.color).filter(Boolean))];
  const materials = [...new Set(allProducts.map(p => p.material).filter(Boolean))];
  const sizes = [...new Set(allProducts.flatMap(p => p.sizes?.map(s => s.size) || []))].sort((a, b) => {
    const numA = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
    const numB = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
    return numA - numB;
  });

  // Dynamic Hex mappings for color circles
  const getColorHex = (colorName) => {
    const name = colorName.toLowerCase().trim();
    const map = {
      black: '#000000',
      white: '#ffffff',
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#22c55e',
      yellow: '#eab308',
      grey: '#8e8e93',
      gray: '#8e8e93',
      orange: '#f97316',
      pink: '#ec4899',
      purple: '#a855f7',
      brown: '#78350f',
      tan: '#d2b48c',
      beige: '#f5f5dc',
      navy: '#1e3a8a',
      suede: '#8b5a2b',
      leather: '#4a2c11',
    };
    return map[name] || '#a1a1aa';
  };

  // Perform multi-dimensional client-side filtering
  useEffect(() => {
    let temp = [...allProducts];

    // 1. Keyword search inside loaded list
    if (searchFilter) {
      temp = temp.filter(p => 
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
        p.description.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    // 2. Category
    if (selectedCategory !== 'All') {
      temp = temp.filter(p => p.category === selectedCategory);
    }

    // 3. Brands
    if (selectedBrands.length > 0) {
      temp = temp.filter(p => p.brand && selectedBrands.includes(p.brand));
    }

    // 4. Sizes
    if (selectedSizes.length > 0) {
      temp = temp.filter(p => p.sizes?.some(s => selectedSizes.includes(s.size) && s.quantity > 0));
    }

    // 5. Colors
    if (selectedColors.length > 0) {
      temp = temp.filter(p => p.color && selectedColors.includes(p.color));
    }

    // 6. Materials
    if (selectedMaterials.length > 0) {
      temp = temp.filter(p => p.material && selectedMaterials.includes(p.material));
    }

    // 7. Price Range
    temp = temp.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // 8. Sorting
    if (sortBy === 'price-low') {
      temp.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      temp.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      temp.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      temp.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(temp);
  }, [allProducts, searchFilter, selectedCategory, selectedBrands, selectedSizes, selectedColors, selectedMaterials, priceRange, sortBy]);

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleMaterial = (material) => {
    setSelectedMaterials(prev => 
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setPriceRange({ min: 0, max: maxPriceLimit });
    setSearchFilter('');
  };

  const activeFiltersCount = 
    (selectedCategory !== 'All' ? 1 : 0) + 
    selectedBrands.length + 
    selectedSizes.length + 
    selectedColors.length + 
    selectedMaterials.length + 
    (priceRange.max < maxPriceLimit || priceRange.min > 0 ? 1 : 0) + 
    (searchFilter ? 1 : 0);

  // Shared Filters Form JSX structure
  const renderFiltersContent = () => (
    <div className="space-y-6">
      
      {/* Clear Action */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800">
        <h3 className="text-lg font-black uppercase tracking-tight">Filters</h3>
        {activeFiltersCount > 0 && (
          <button 
            onClick={clearAllFilters}
            className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Local Search inside loaded list */}
      <div>
        <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Search Catalog</label>
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
          <input 
            type="text" 
            placeholder="Type name, tag..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-zinc-800 border-none rounded-xl text-xs outline-none focus:ring-2 ring-black dark:ring-white transition-all font-bold"
          />
        </div>
      </div>

      {/* Categories */}
      {categories.length > 1 && (
        <div>
          <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Categories</label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-black text-white dark:bg-white dark:text-black font-black scale-105'
                    : 'bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-black uppercase text-gray-400 tracking-wider">Price Range</label>
          <span className="text-xs font-black">₹{priceRange.min} - ₹{priceRange.max}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max={maxPriceLimit || 50000} 
          value={priceRange.max}
          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
          className="w-full accent-black dark:accent-white cursor-pointer h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
          <span>₹0</span>
          <span>₹{(maxPriceLimit || 50000).toLocaleString()}</span>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-3">Brands</label>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
            {brands.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer text-xs font-bold group select-none">
                <input 
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="rounded border-gray-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors capitalize">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* UK Sizes */}
      {sizes.length > 0 && (
        <div>
          <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Sizes (UK)</label>
          <div className="grid grid-cols-4 gap-1.5">
            {sizes.map(size => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`py-2 rounded-lg text-xs font-black border text-center transition-all ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white scale-105 shadow-sm'
                      : 'bg-transparent border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-gray-400 dark:hover:border-zinc-600 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {size.replace('UK', '').trim()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors dynamic swatches */}
      {colors.length > 0 && (
        <div>
          <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-3">Colors</label>
          <div className="flex flex-wrap gap-2.5">
            {colors.map(color => {
              const isSelected = selectedColors.includes(color);
              const hex = getColorHex(color);
              const isLight = hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#f5f5dc' || hex.toLowerCase() === '#beige';
              return (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  style={{ backgroundColor: hex }}
                  title={color}
                  className={`w-7 h-7 rounded-full relative flex items-center justify-center transition-all hover:scale-110 shadow-sm border ${
                    isSelected 
                      ? 'ring-2 ring-black dark:ring-white ring-offset-2 scale-105' 
                      : 'border-gray-200 dark:border-zinc-800'
                  }`}
                >
                  {isSelected && (
                    <FaCheck className={`text-[10px] ${isLight ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <div>
          <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-3">Material</label>
          <div className="space-y-2">
            {materials.map(mat => (
              <label key={mat} className="flex items-center gap-2 cursor-pointer text-xs font-bold group select-none">
                <input 
                  type="checkbox"
                  checked={selectedMaterials.includes(mat)}
                  onChange={() => toggleMaterial(mat)}
                  className="rounded border-gray-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors capitalize">{mat}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-gray-400 text-sm sm:text-lg max-w-xl">
              Showing {filteredProducts.length} of {allProducts.length} available products
            </p>
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="text-xs font-black text-red-400 hover:text-red-500 uppercase tracking-widest bg-zinc-800/40 border border-zinc-800 dark:border-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Main Grid Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* DESKTOP STICKY FILTER PANEL */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/60 sticky top-24 max-h-[85vh] overflow-y-auto scrollbar-thin">
              {renderFiltersContent()}
            </div>
          </div>

          {/* RIGHT SIDE: PRODUCTS & MOBILE SORT/FILTER CONTROLS */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Controls Bar */}
            <div className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/60">
              
              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase tracking-wide shadow active:scale-95 transition-all"
              >
                <FaFilter /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>

              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Sort Products</span>
              </div>

              {/* Sorting Select */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 dark:bg-zinc-800 px-3 sm:px-4 py-2 rounded-xl font-black text-xs sm:text-sm focus:outline-none focus:ring-2 ring-black dark:ring-white cursor-pointer border border-gray-100 dark:border-zinc-700"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {/* Active Filters Badges Row */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 items-center p-3 bg-gray-100/50 dark:bg-zinc-900/30 rounded-xl px-4">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Active:</span>
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-800 text-[10px] font-bold rounded-lg border shadow-sm">
                    Category: {selectedCategory}
                    <FaTimesCircle className="text-red-400 hover:text-red-600 cursor-pointer" onClick={() => setSelectedCategory('All')} />
                  </span>
                )}
                {selectedBrands.map(b => (
                  <span key={b} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-800 text-[10px] font-bold rounded-lg border shadow-sm capitalize">
                    {b}
                    <FaTimesCircle className="text-red-400 hover:text-red-600 cursor-pointer" onClick={() => toggleBrand(b)} />
                  </span>
                ))}
                {selectedSizes.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-800 text-[10px] font-bold rounded-lg border shadow-sm uppercase">
                    Size {s.replace('UK','')}
                    <FaTimesCircle className="text-red-400 hover:text-red-600 cursor-pointer" onClick={() => toggleSize(s)} />
                  </span>
                ))}
                {selectedColors.map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-800 text-[10px] font-bold rounded-lg border shadow-sm capitalize">
                    Color: {c}
                    <FaTimesCircle className="text-red-400 hover:text-red-600 cursor-pointer" onClick={() => toggleColor(c)} />
                  </span>
                ))}
                {selectedMaterials.map(m => (
                  <span key={m} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-800 text-[10px] font-bold rounded-lg border shadow-sm capitalize">
                    {m}
                    <FaTimesCircle className="text-red-400 hover:text-red-600 cursor-pointer" onClick={() => toggleMaterial(m)} />
                  </span>
                ))}
                {priceRange.max < maxPriceLimit && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-800 text-[10px] font-bold rounded-lg border shadow-sm">
                    Under ₹{priceRange.max}
                    <FaTimesCircle className="text-red-400 hover:text-red-600 cursor-pointer" onClick={() => setPriceRange(prev => ({ ...prev, max: maxPriceLimit }))} />
                  </span>
                )}
                {searchFilter && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-800 text-[10px] font-bold rounded-lg border shadow-sm">
                    Search: "{searchFilter}"
                    <FaTimesCircle className="text-red-400 hover:text-red-600 cursor-pointer" onClick={() => setSearchFilter('')} />
                  </span>
                )}
              </div>
            )}

            {/* PRODUCT GRID */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, idx) => (
                  <SkeletonProductCard key={idx} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 sm:py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/60 shadow-sm px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                  <FaSearch className="text-2xl sm:text-3xl text-gray-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black mb-2">No matching products</h2>
                <p className="text-gray-500 mb-6 text-sm sm:text-base max-w-sm mx-auto">
                  We couldn't find any shoes matching your selection. Try adjusting or clearing your filters.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-80 active:scale-95 transition-all shadow"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product, idx) => (
                  <div 
                    key={product._id || idx} 
                    className="animate-slide-in-up"
                    style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER SLIDE-OVER DRAWER */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 lg:hidden backdrop-blur-sm ${
          showMobileFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setShowMobileFilters(false)}
      ></div>

      {/* Drawer Container */}
      <div 
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-zinc-900 z-[101] p-6 shadow-2xl transition-transform duration-300 transform lg:hidden overflow-y-auto flex flex-col justify-between ${
          showMobileFilters ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black uppercase">Refine Selection</h3>
            <button 
              onClick={() => setShowMobileFilters(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-sm"
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Filters List */}
          {renderFiltersContent()}
        </div>

        {/* Floating Apply Action */}
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <button 
            onClick={() => setShowMobileFilters(false)}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-wider rounded-xl active:scale-95 shadow transition-all"
          >
            Apply Filters ({filteredProducts.length} Shoes)
          </button>
        </div>
      </div>

    </div>
  );
};

export default ShopPage;