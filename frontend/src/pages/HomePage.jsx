import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toast } from 'react-toastify';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

gsap.registerPlugin(ScrollTrigger);

// Placeholder images: Using high-quality Unsplash images for maximum reliability
const SHOE_FRONT = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80";
const SHOE_SIDE = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80"; // Using same for demo if angles aren't available
const SHOE_BACK = "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=80";

const HomePage = () => {
  const containerRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const textRef = useRef(null);
  const shopSectionRef = useRef(null);
  
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [selectedHeroSize, setSelectedHeroSize] = useState('');

  // Fetch Products for the "More" section
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        setProducts(data);
        const featured = data.find(p => p.isFeatured) || data[0];
        if (featured && featured.sizes && featured.sizes.length > 0) {
            setSelectedHeroSize(featured.sizes[0].size);
        }
      } catch (error) {
        console.error("Failed to fetch products");
      }
    };
    fetchProducts();
  }, []);

  // Refs for the 3 images to toggle opacity
  const imgFrontRef = useRef(null);
  const imgSideRef = useRef(null);
  const imgBackRef = useRef(null);

  // Defines the product we are "selling" on this landing page (Hero section)
  const featuredProduct = products.find(p => p.isFeatured) || products[0];

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
    } else {
        toast.error('Product not found');
    }
  };

  const getStockForSize = (sizeName) => {
    if (!featuredProduct || !featuredProduct.sizes) return 0;
    return featuredProduct.sizes.find(s => s.size === sizeName)?.quantity || 0;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. PIN THE LEFT COLUMN
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: leftColRef.current,
        scrub: true,
      });

      // 2. PARALLAX TEXT (Behind the shoe)
      // We want the text "AIR MAX" to move horizontally as we scroll
      gsap.to(textRef.current, {
        x: -200, 
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        }
      });

      // 3. IMAGE SEQUENCE (Crossfade)
      // Timeline allows us to sequence these changes over the scroll distance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        }
      });

      // Hide FRONT, Show SIDE at 33%
      tl.to(imgFrontRef.current, { opacity: 0, duration: 1 }, 0.3)
        .to(imgSideRef.current, { opacity: 1, duration: 1 }, 0.3);
      
      // Hide SIDE, Show BACK at 66%
      tl.to(imgSideRef.current, { opacity: 0, duration: 1 }, 0.6)
        .to(imgBackRef.current, { opacity: 1, duration: 1 }, 0.6);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
    <div ref={containerRef} className="flex min-h-[300vh] bg-gray-100 dark:bg-deep-void text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* --- LEFT COLUMN (PINNED) --- */}
      <div ref={leftColRef} className="w-1/2 h-screen flex items-center justify-center sticky top-0 overflow-hidden">
        
        {/* BIG BACKGROUND TEXT (Parallax) */}
        <h1 ref={textRef} className="absolute text-[10vw] font-bold text-gray-300/20 dark:text-gray-700/20 whitespace-nowrap select-none z-0">
          {featuredProduct?.name?.toUpperCase() || 'AIR MAX 270'}
        </h1>

        {/* IMAGE STACK (Z-Index > Text) */}
        <div className="relative w-[30vw] h-[30vw] z-10">
          {/* Front Image (Visible initially) */}
          <img 
            ref={imgFrontRef} 
            src={featuredProduct?.images?.front || SHOE_FRONT} 
            alt="Shoe Front" 
            className="absolute inset-0 w-full h-full object-contain opacity-100" // Start visible
          />
          {/* Side Image (Hidden initially) */}
          <img 
            ref={imgSideRef} 
            src={featuredProduct?.images?.side || SHOE_SIDE} 
            alt="Shoe Side" 
            className="absolute inset-0 w-full h-full object-contain opacity-0" 
          />
          {/* Back Image (Hidden initially) */}
          <img 
            ref={imgBackRef} 
            src={featuredProduct?.images?.back || SHOE_BACK} 
            alt="Shoe Back" 
            className="absolute inset-0 w-full h-full object-contain opacity-0" 
          />
        </div>
      </div>

      {/* --- RIGHT COLUMN (SCROLLABLE) --- */}
      <div ref={rightColRef} className="w-1/2 flex flex-col items-start justify-between py-20 px-20">
        
        {/* SECTION 1: DESIGN */}
        <div className="h-screen flex flex-col justify-center">
          <h2 className="text-6xl font-black mb-4 uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            The Design
          </h2>
          <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300 mb-8 max-w-md">
            Engineered for the modern aesthetic. The sleek lines and dynamic curves create a visual sensation even when standing still.
          </p>
          <button 
            onClick={() => shopSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 w-fit border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-widest font-bold"
          >
            Explore Collection
          </button>
        </div>

        {/* SECTION 2: COMFORT */}
        <div className="h-screen flex flex-col justify-center">
          <h2 className="text-6xl font-black mb-4 uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            The Comfort
          </h2>
          <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300 mb-8 max-w-md">
            Our patented Air unit provides responsive cushioning that adapts to your every step. It feels like walking on condensed clouds.
          </p>
          <div className="flex gap-4">
            <span className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-full">Lightweight</span>
            <span className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-full">Breathable</span>
          </div>
        </div>

        {/* SECTION 3: GRIP / BUY */}
        <div className="h-screen flex flex-col justify-center">
          <h2 className="text-6xl font-black mb-4 uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
            The Grip
          </h2>
          <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300 mb-8 max-w-md">
            Multi-surface traction durability. Ready for the court, the street, and everywhere in between.
          </p>
          
          <div className="mt-8 border-t border-gray-300 dark:border-gray-700 pt-8 w-full max-w-md">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="block text-sm text-gray-500 uppercase tracking-widest">Price</span>
                <span className="text-4xl font-bold">₹{featuredProduct?.price?.toLocaleString() || '11,495'}</span>
              </div>
              <div className="flex gap-2">
                 {/* Size Selector */}
                 {featuredProduct?.sizes?.map((s, idx) => (
                   <button 
                    key={idx} 
                    disabled={s.quantity === 0}
                    onClick={() => setSelectedHeroSize(s.size)}
                    className={`w-10 h-10 border flex items-center justify-center transition-all ${
                        selectedHeroSize === s.size 
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' 
                        : 'border-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                    } ${s.quantity === 0 ? 'opacity-20 cursor-not-allowed' : ''}`}
                   >
                     {s.size}
                   </button>
                 ))}
                 {!featuredProduct?.sizes && ['7', '8', '9', '10'].map(size => (
                   <button key={size} className="w-10 h-10 border border-gray-400 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                     {size}
                   </button>
                 ))}
              </div>
            </div>
            <button 
              onClick={addToCartHandler}
              className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-black text-xl uppercase tracking-widest hover:scale-[1.02] transition-transform"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* --- NEW SECTION: TRENDING DROPS --- */}
    <div ref={shopSectionRef} className="py-20 px-6 md:px-20 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors duration-300">
        <h2 className="text-5xl font-black uppercase mb-12 text-center">Trending Drops</h2>
        
        {products.length === 0 ? (
            <div className="text-center text-gray-500">
                <p>Loading products...</p>
                <p className="text-sm mt-2">Make sure backend is running!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        )}
    </div>
    </>
  );
};
export default HomePage;
