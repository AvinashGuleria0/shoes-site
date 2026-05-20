import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { SkeletonHero } from '../components/Skeleton';
import { FaArrowRight, FaShippingFast, FaUndo, FaHeadset, FaStar, FaPaperPlane } from 'react-icons/fa';
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
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHeroSize, setSelectedHeroSize] = useState('');

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    query: '',
    message: ''
  });
  const [sendingContact, setSendingContact] = useState(false);

  // Restore draft message from localStorage on mount/auth state change, or auto-fill name & email if logged in
  useEffect(() => {
    const savedDraft = localStorage.getItem('kicks_contact_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setContactForm({
          query: draft.query || '',
          message: draft.message || '',
          name: userInfo?.name || draft.name || '',
          email: userInfo?.email || draft.email || ''
        });
        localStorage.removeItem('kicks_contact_draft');
        if (userInfo) {
          toast.success('Welcome back! Your message draft has been restored.');
        } else {
          toast.info('Your draft message has been restored.');
        }
      } catch (e) {
        console.error('Failed to parse contact draft', e);
      }
    } else {
      setContactForm(prev => ({
        ...prev,
        name: userInfo?.name || '',
        email: userInfo?.email || ''
      }));
    }
  }, [userInfo]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInfo) {
      // Save form draft to localStorage
      localStorage.setItem('kicks_contact_draft', JSON.stringify(contactForm));
      toast.warning('Please sign in to send a message. Your draft has been saved!');
      navigate('/login?redirect=/');
      return;
    }

    const nameToSend = userInfo.name || contactForm.name;
    const emailToSend = userInfo.email || contactForm.email;

    if (!nameToSend || !emailToSend || !contactForm.query || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSendingContact(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users/contact`, {
        name: nameToSend,
        email: emailToSend,
        query: contactForm.query,
        message: contactForm.message
      });
      toast.success('Your message has been sent successfully!');
      setContactForm({
        name: userInfo.name || '',
        email: userInfo.email || '',
        query: '',
        message: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingContact(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        
        // Handle different API response structures safely
        const productsArray = Array.isArray(data) ? data : (data?.products || []);
        
        setProducts(productsArray);

        const featured = productsArray.find(p => p.isFeatured) || productsArray[0];
        if (featured && featured.sizes && featured.sizes.length > 0) {
          setSelectedHeroSize(featured.sizes[0].size);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
        setProducts([]); 
      } finally {
        setLoading(false);
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

  if (loading) {
    return <SkeletonHero />;
  }

  return (
    <div ref={heroRef} className="bg-gray-50 dark:bg-deep-void text-gray-900 dark:text-white transition-colors duration-500">
      
      {/* ========== HERO SECTION ========== */}
      <section className="min-h-screen pt-16 sm:pt-20 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-purple-500/5 dark:from-red-500/10 dark:to-purple-500/10"></div>
        
        {/* Background Text */}
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] sm:text-[25vw] lg:text-[20vw] font-black text-gray-200/30 dark:text-white/5 whitespace-nowrap select-none pointer-events-none">
          {featuredProduct?.name?.split(' ')[0]?.toUpperCase() || 'KICKS'}
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
      <section className="py-6 sm:py-8 bg-white dark:bg-zinc-900 text-black dark:text-white border-y border-gray-200 dark:border-zinc-800">
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
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{feature.sub}</span>
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

      {/* ========== SPOTLIGHT SECTION ========== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white dark:bg-zinc-950">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">SPOTLIGHT</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto text-sm sm:text-base">
            Classic silhouettes and cutting-edge innovation to build your game from the ground up.
          </p>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 sm:gap-8 justify-center items-end">
            {products.slice(0, 16).map((product) => (
              <Link to={`/product/${product._id}`} key={product._id} className="flex flex-col items-center group cursor-pointer">
                <div className="h-16 sm:h-20 w-full flex items-center justify-center mb-3">
                  <img 
                    src={getImageUrl(product?.images?.side)} 
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-center group-hover:text-red-500 transition-colors">
                  {product.name.split(' ').slice(0, 3).join(' ')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CONTACT SECTION ========== */}
      <section className="bg-zinc-100 dark:bg-[#0c0c0e] py-16 sm:py-24 px-4 sm:px-6 md:px-12 transition-colors duration-500 overflow-hidden relative">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row gap-0 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
          
          {/* Left Column: Contact Me Info */}
          <div className="flex-1 bg-zinc-200 dark:bg-zinc-900 p-8 sm:p-12 md:p-16 flex flex-col justify-between relative border-b-8 border-orange-500 md:border-b-0 md:border-r-8 md:border-r-orange-500">
            {/* Top Decorative Diagonal Accent */}
            <div className="absolute top-8 right-8 w-8 h-8 border-2 border-orange-500 transform rotate-45 flex items-center justify-center">
              <div className="w-4 h-4 bg-orange-500"></div>
            </div>
            
            <div className="my-auto">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-8 text-black dark:text-white">
                Contact Me<span className="text-orange-500">.</span>
              </h2>
              
              <div className="space-y-6 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                <p className="border-l-4 border-orange-500 pl-4 font-medium italic">
                  "I will read all mails you send me. I literally mean it. So if you want to share something, feel free to reach out."
                </p>
                <p>
                  I need your <strong className="text-black dark:text-white font-bold">Name</strong> and <strong className="text-black dark:text-white font-bold">Gmail address</strong> for communicating.
                </p>
              </div>
            </div>
            
            {/* Hand-drawn styled arrow indicator at the bottom (shown as SVG pointing down-right) */}
            <div className="hidden md:block absolute bottom-8 left-12 opacity-50 dark:invert text-zinc-500">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 5C10 15 20 25 30 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
                <path d="M22 20L30 25L25 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          
          {/* Right Column: Send Message Form */}
          <div className="flex-1 bg-white dark:bg-[#101012] p-8 sm:p-12 md:p-16 text-zinc-900 dark:text-white border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800/80 transition-colors duration-500">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-8">
              Send Me a Message<span className="text-orange-500">.</span>
            </h3>
            
            <form onSubmit={handleContactSubmit} className="space-y-6">
              {userInfo ? (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-orange-500/20 flex-shrink-0 animate-pulse">
                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-orange-600 dark:text-orange-400 font-black mb-0.5">Signed In As</p>
                    <h4 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white leading-tight">{userInfo.name}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium break-all">{userInfo.email}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="Your Name"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-[#141416] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-[#141416] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">Query / Topic</label>
                <select
                  required
                  value={contactForm.query}
                  onChange={(e) => setContactForm({ ...contactForm, query: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#141416] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors text-zinc-900 dark:text-zinc-300"
                >
                  <option value="" disabled className="bg-white dark:bg-[#141416] text-zinc-500">Select Your Query Type</option>
                  <option value="Order Support" className="bg-white dark:bg-[#141416] text-zinc-900 dark:text-white">Order & Delivery Support</option>
                  <option value="Product Question" className="bg-white dark:bg-[#141416] text-zinc-900 dark:text-white">Product Availability & Sizing</option>
                  <option value="Business Inquiry" className="bg-white dark:bg-[#141416] text-zinc-900 dark:text-white">Business Cooperation / Wholesales</option>
                  <option value="Feedback" className="bg-white dark:bg-[#141416] text-zinc-900 dark:text-white">Feedback / Suggestions</option>
                  <option value="Other" className="bg-white dark:bg-[#141416] text-zinc-900 dark:text-white">Other Issues</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">Message</label>
                <textarea 
                  rows="4"
                  placeholder="Tell me what's on your mind..."
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#141416] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                disabled={sendingContact}
                className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg shadow-orange-500/20"
              >
                {sendingContact ? 'Sending...' : (
                  <>
                    Send Message <FaPaperPlane size={14} />
                  </>
                )}
              </button>
            </form>
          </div>

          
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 bg-gray-50 dark:bg-black text-black dark:text-white border-t border-gray-200 dark:border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <img src={logo} alt="Kicks Store" className="h-10 w-auto object-contain dark:invert" />
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">KICKS</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Premium sneakers, delivered.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold uppercase tracking-wider">
              <Link to="/shop" className="hover:text-red-500 transition-colors">Shop</Link>
              <Link to="/cart" className="hover:text-red-500 transition-colors">Cart</Link>
              <Link to="/wishlist" className="hover:text-red-500 transition-colors">Wishlist</Link>
              <Link to="/profile" className="hover:text-red-500 transition-colors">Account</Link>
              <a href="mailto:support@kicks.com" className="hover:text-red-500 transition-colors">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-zinc-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
            © 2026 KICKS. All rights reserved. Made with ❤️
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
