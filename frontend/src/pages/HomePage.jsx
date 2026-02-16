import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { FaArrowRight, FaShippingFast, FaUndo, FaHeadset, FaStar } from 'react-icons/fa';
import logo from '../assets/logo.jpeg';

gsap.registerPlugin(ScrollTrigger);

const SHOE_PLACEHOLDER = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80";

const HomePage = () => {
  const heroRef = useRef(null);
  const heroShoeRef = useRef(null);
  const heroTextRef = useRef(null);
  const featuresRef = useRef(null);
  const shopSectionRef = useRef(null);
  const compareRef = useRef(null);
  
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [selectedHeroSize, setSelectedHeroSize] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        setProducts(data);
        const featured = data.find(p => p.isFeatured) || data[0];
        if (featured && featured.sizes && featured.sizes.length > 0) {
          setSelectedHeroSize(featured.sizes[0].size);
        }
      } catch {
        console.error("Failed to fetch products");
      }
    };
    fetchProducts();
  }, []);

  const featuredProduct = products.find(p => p.isFeatured) || products[0];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return SHOE_PLACEHOLDER;
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  };

  const addToCartHandler = () => {
    if (featuredProduct) {
      if (!selectedHeroSize) {
        toast.error('Please select a size');
        return;
      }
      
      const sizeData = featuredProduct.sizes?.find(s => s.size === selectedHeroSize);
      if (!sizeData || sizeData.quantity <= 0) {
        toast.error('This size is currently out of stock');
        return;
      }

      dispatch(addToCart({ 
        ...featuredProduct, 
        qty: 1, 
        size: selectedHeroSize,
        countInStock: sizeData.quantity
      }));
      toast.success(`Added ${featuredProduct.name} to Cart!`);
    }
  };

  // Stock helper - currently unused but may be needed for future enhancements

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero shoe floating animation
      if (heroShoeRef.current) {
        gsap.to(heroShoeRef.current, {
          y: -20,
          rotation: 5,
          duration: 3,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1
        });
      }

      // Hero text reveal
      if (heroTextRef.current?.children) {
        gsap.fromTo(heroTextRef.current.children, 
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: "power3.out", delay: 0.3 }
        );
      }

      // Features scroll animation
      if (featuresRef.current) {
        gsap.fromTo(featuresRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 80%",
            }
          }
        );
      }

      // Compare section bar animations
      const statBars = document.querySelectorAll('.stat-bar-fill');
      statBars.forEach(bar => {
        const width = bar.dataset.width;
        ScrollTrigger.create({
          trigger: bar,
          start: "top 90%",
          onEnter: () => { bar.style.width = width; }
        });
      });

    }, heroRef);

    return () => ctx.revert();
  }, [products]);

  // Compare products (use first 2)
  const compareProducts = products.slice(0, 2);

  return (
    <div ref={heroRef} className="bg-gray-50 dark:bg-deep-void text-gray-900 dark:text-white transition-colors duration-500">
      
      {/* ========== HERO SECTION ========== */}
      <section className="min-h-screen pt-16 sm:pt-20 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-purple-500/5 dark:from-red-500/10 dark:to-purple-500/10"></div>
        
        {/* Background Text */}
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] sm:text-[25vw] lg:text-[20vw] font-black text-gray-200/30 dark:text-white/5 whitespace-nowrap select-none pointer-events-none">
          {featuredProduct?.name?.split(' ')[0]?.toUpperCase() || 'PADVYK'}
        </h1>

        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-[calc(100vh-80px)] flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 relative z-10">
          
          {/* Left: Hero Image */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="relative w-full max-w-[280px] sm:max-w-[380px] md:max-w-[450px] lg:max-w-[500px]">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-3xl opacity-20 scale-75"></div>
              
              {/* Shoe Image */}
              <img 
                ref={heroShoeRef}
                src={getImageUrl(featuredProduct?.images?.side)} 
                alt={featuredProduct?.name || 'Featured Shoe'}
                className="relative w-full h-auto aspect-[5/4] object-contain drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.3))' }}
              />
            </div>
          </div>

          {/* Right: Hero Content */}
          <div ref={heroTextRef} className="flex-1 max-w-xl text-center lg:text-left">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">
              New Collection 2026
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-4 sm:mb-6">
              <span className="block">Fresh</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Drops
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed px-4 lg:px-0">
              {featuredProduct?.description?.substring(0, 120) || 'Experience next-level comfort and style with our latest collection of premium sneakers.'}...
            </p>

            {/* Size Selector */}
            {featuredProduct?.sizes && featuredProduct.sizes.length > 0 && (
              <div className="mb-6 px-4 lg:px-0">
                <span className="text-xs font-bold uppercase text-gray-500 mb-3 block tracking-wider">Select Size (UK)</span>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {featuredProduct.sizes.map((s, idx) => (
                    <button 
                      key={idx} 
                      disabled={s.quantity === 0}
                      onClick={() => setSelectedHeroSize(s.size)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold text-sm sm:text-base transition-all ${
                        selectedHeroSize === s.size 
                          ? 'bg-black text-white dark:bg-white dark:text-black ring-2 ring-offset-2 ring-black dark:ring-white' 
                          : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                      } ${s.quantity === 0 ? 'opacity-30 cursor-not-allowed line-through' : ''}`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price & CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-4 lg:px-0">
              <div className="text-center sm:text-left">
                <span className="text-sm text-gray-500 line-through">₹{((featuredProduct?.price || 9999) * 1.2).toLocaleString()}</span>
                <span className="block text-3xl sm:text-4xl font-black">₹{featuredProduct?.price?.toLocaleString() || '9,999'}</span>
              </div>
              
              <button 
                onClick={addToCartHandler}
                className="w-full sm:flex-1 py-3 sm:py-4 px-6 sm:px-8 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all transform hover:scale-[1.02] btn-ripple text-sm sm:text-base"
              >
                Add to Cart <FaArrowRight />
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* ========== FEATURES STRIP ========== */}
      <section className="py-6 sm:py-8 bg-black dark:bg-zinc-900 text-white">
        <div ref={featuresRef} className="container mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-16">
          {[
            { icon: <FaShippingFast size={20} />, text: 'Free Shipping', sub: 'On orders over ₹2000' },
            { icon: <FaUndo size={20} />, text: '30-Day Returns', sub: 'Easy returns policy' },
            { icon: <FaHeadset size={20} />, text: '24/7 Support', sub: "We're here to help" },
            { icon: <FaStar size={20} />, text: 'Premium Quality', sub: 'Authentic products' },
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="text-red-500">{feature.icon}</div>
              <div>
                <span className="font-bold block text-sm sm:text-base">{feature.text}</span>
                <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">{feature.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== SHOP SECTION ========== */}
      <section ref={shopSectionRef} className="py-12 sm:py-20 px-4 sm:px-6 md:px-12 bg-white dark:bg-zinc-950">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
            <div>
              <span className="text-red-500 font-bold uppercase tracking-widest text-xs sm:text-sm">Explore</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter">Trending Now</h2>
            </div>
            <Link 
              to="/shop" 
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-black dark:border-white rounded-full font-bold uppercase tracking-wider text-sm sm:text-base hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
            >
              View All <FaArrowRight />
            </Link>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.slice(0, 8).map((product, idx) => (
                <div key={product._id} className="animate-slide-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== COMPARE SECTION ========== */}
      {compareProducts.length >= 2 && (
        <section ref={compareRef} className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-100 dark:bg-zinc-900">
          <div className="container mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-red-500 font-bold uppercase tracking-widest text-xs sm:text-sm">Compare</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter">Compare Models</h2>
            </div>

            <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6 sm:gap-8 relative">
              {/* Product 1 */}
              <div className="flex-1 max-w-md mx-auto w-full bg-white dark:bg-zinc-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl hover-lift">
                <div className="h-32 sm:h-48 flex items-center justify-center mb-4 sm:mb-6">
                  <img 
                    src={getImageUrl(compareProducts[0]?.images?.side)} 
                    alt={compareProducts[0]?.name}
                    className="max-h-full object-contain drop-shadow-lg hover:scale-110 hover:rotate-[-10deg] transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">{compareProducts[0]?.name}</h3>
                
                {/* Stats */}
                {[
                  { label: 'Cushioning', value: '70%' },
                  { label: 'Durability', value: '85%' },
                  { label: 'Weight', value: '90%', text: 'Light' },
                ].map((stat, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      <span>{stat.label}</span>
                      <span>{stat.text || stat.value}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black dark:bg-white rounded-full stat-bar-fill" 
                        data-width={stat.value}
                        style={{ width: 0 }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                <Link 
                  to={`/product/${compareProducts[0]?._id}`}
                  className="block w-full text-center py-3 mt-6 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold uppercase tracking-wider hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all"
                >
                  View Details
                </Link>
              </div>

              {/* VS Badge */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center font-black text-xl border-4 border-gray-100 dark:border-zinc-700">
                  VS
                </div>
              </div>

              {/* Product 2 */}
              <div className="flex-1 max-w-md mx-auto w-full bg-white dark:bg-zinc-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl hover-lift">
                <div className="h-32 sm:h-48 flex items-center justify-center mb-4 sm:mb-6">
                  <img 
                    src={getImageUrl(compareProducts[1]?.images?.side)} 
                    alt={compareProducts[1]?.name}
                    className="max-h-full object-contain drop-shadow-lg hover:scale-110 hover:rotate-[10deg] transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">{compareProducts[1]?.name}</h3>
                
                {/* Stats */}
                {[
                  { label: 'Cushioning', value: '95%' },
                  { label: 'Durability', value: '75%' },
                  { label: 'Weight', value: '60%', text: 'Medium' },
                ].map((stat, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      <span>{stat.label}</span>
                      <span>{stat.text || stat.value}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full stat-bar-fill" 
                        data-width={stat.value}
                        style={{ width: 0 }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                <Link 
                  to={`/product/${compareProducts[1]?._id}`}
                  className="block w-full text-center py-3 mt-6 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold uppercase tracking-wider hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== FOOTER ========== */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 bg-black text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <img src={logo} alt="PADVYK CREATIONS" className="h-10 w-auto object-contain" />
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">PADVYK CREATIONS</h3>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">Premium sneakers, delivered.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold uppercase tracking-wider">
              <Link to="/shop" className="hover:text-red-500 transition-colors">Shop</Link>
              <Link to="/cart" className="hover:text-red-500 transition-colors">Cart</Link>
              <Link to="/wishlist" className="hover:text-red-500 transition-colors">Wishlist</Link>
              <Link to="/profile" className="hover:text-red-500 transition-colors">Account</Link>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
            © 2026 PADVYK CREATIONS PRIVATE LIMITED. All rights reserved. Made with ❤️
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
