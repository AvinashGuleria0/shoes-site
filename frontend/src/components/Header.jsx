import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaSun, FaMoon, FaSearch, FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/logo.jpeg';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist) || { wishlistItems: [] };
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Dark Mode State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [keyword, setKeyword] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
    navigate('/');
  };

  const searchHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?keyword=${keyword}`);
      setShowSearch(false);
      setMobileMenuOpen(false);
    } else {
      navigate('/shop');
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 text-gray-800 dark:text-white dark:bg-black/70 dark:border-white/10 shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 relative z-10" title="Kicks Store">
          <img src={logo} alt="Kicks" className="h-10 sm:h-12 w-auto object-contain" />
          <span className="hidden md:block text-sm lg:text-base font-bold tracking-tight">KICKS</span>
        </Link>

        {/* NAVIGATION LINKS - Hidden on mobile */}
        {!showSearch && (
            <div className="hidden lg:flex items-center space-x-8 font-bold uppercase tracking-widest text-sm absolute left-1/2 transform -translate-x-1/2">
                <Link to="/" className="hover:text-red-500 transition-colors">Home</Link>
                <Link to="/shop" className="hover:text-red-500 transition-colors">Shop</Link>
                <Link to="/cart" className="hover:text-red-500 transition-colors">Cart</Link>
            </div>
        )}

        {/* ICONS & SEARCH */}
        <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 relative z-10">
          
          {/* SEARCH BAR */}
          {showSearch ? (
              <form onSubmit={searchHandler} className="absolute right-0 top-0 h-full flex items-center bg-white dark:bg-black p-2 rounded-full border border-gray-200 dark:border-zinc-700 shadow-lg" style={{ right: '100%', marginRight: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="bg-transparent outline-none px-3 py-1 w-32 sm:w-40 text-sm"
                    autoFocus
                  />
                  <button type="submit" className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
                      <FaSearch />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowSearch(false)}
                    className="ml-2 text-xs font-bold text-red-500"
                  >
                      ✕
                  </button>
              </form>
          ) : (
            <button onClick={() => setShowSearch(true)} className="hover:text-red-500 transition-colors">
                <FaSearch className="text-lg sm:text-xl" />
            </button>
          )}

          <button onClick={toggleTheme} className="hover:text-red-500 transition-colors hidden sm:block">
            {theme === 'dark' ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
          </button>
          
          <Link to="/wishlist" className="relative hover:text-red-500 transition-colors block">
             <FaHeart className="text-xl" />
             {wishlistItems && wishlistItems.length > 0 && (
                 <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                   {wishlistItems.length}
                 </span>
             )}
          </Link>

          <Link to="/cart" className="relative group">
            <FaShoppingCart className="text-lg sm:text-xl group-hover:text-red-500 transition-colors" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
              </span>
            )}
          </Link>

          {userInfo ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Profile Button - Visible on all sizes */}
              <Link to="/profile" className="hover:text-red-500 transition-colors flex items-center gap-1 sm:gap-2">
                <FaUser className="text-lg sm:text-xl" />
                <span className="hidden sm:inline text-xs uppercase font-bold text-gray-500">{userInfo.name ? userInfo.name.split(' ')[0] : 'USER'}</span>
              </Link>

              {/* ADMIN LINK */}
              {(userInfo.role === 'admin' || userInfo.role === 'superadmin') && (
                <Link to="/admin/dashboard" className="text-[10px] font-black bg-red-600 text-white px-2 py-1 rounded tracking-tighter hover:bg-red-700 transition-all hidden lg:block">
                  ADMIN
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <FaSignOutAlt className="text-xl" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 hover:text-red-500 transition-colors">
              <FaUser className="text-xl" />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden text-xl p-1 hover:text-red-500 transition-colors"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
    </header>

    {/* Mobile Menu Overlay */}
    {mobileMenuOpen && (
      <div className="lg:hidden fixed inset-0 top-[64px] bg-white dark:bg-zinc-950 z-40 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Mobile Search */}
          <form onSubmit={searchHandler} className="mb-8">
            <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 bg-transparent px-4 py-3 outline-none"
              />
              <button type="submit" className="px-4 py-3 text-gray-500 hover:text-black dark:hover:text-white">
                <FaSearch />
              </button>
            </div>
          </form>

          {/* Mobile Nav Links */}
          <nav className="space-y-4 mb-8">
            <Link 
              to="/" 
              onClick={closeMobileMenu}
              className="block text-2xl font-black uppercase tracking-tight py-3 border-b border-gray-100 dark:border-zinc-800 hover:text-red-500 transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              onClick={closeMobileMenu}
              className="block text-2xl font-black uppercase tracking-tight py-3 border-b border-gray-100 dark:border-zinc-800 hover:text-red-500 transition-colors"
            >
              Shop
            </Link>
            <Link 
              to="/cart" 
              onClick={closeMobileMenu}
              className="block text-2xl font-black uppercase tracking-tight py-3 border-b border-gray-100 dark:border-zinc-800 hover:text-red-500 transition-colors"
            >
              Cart {cartItems.length > 0 && <span className="text-red-500">({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>}
            </Link>
            <Link 
              to="/wishlist" 
              onClick={closeMobileMenu}
              className="block text-2xl font-black uppercase tracking-tight py-3 border-b border-gray-100 dark:border-zinc-800 hover:text-red-500 transition-colors"
            >
              Wishlist {wishlistItems && wishlistItems.length > 0 && <span className="text-red-500">({wishlistItems.length})</span>}
            </Link>
          </nav>

          {/* User Section */}
          <div className="space-y-4">
            {userInfo ? (
              <>
                <Link 
                  to="/profile" 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl"
                >
                  <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-black text-lg">
                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-bold">{userInfo.name}</p>
                    <p className="text-sm text-gray-500">{userInfo.email}</p>
                  </div>
                </Link>
                
                {(userInfo.role === 'admin' || userInfo.role === 'superadmin') && (
                  <Link 
                    to="/admin/dashboard" 
                    onClick={closeMobileMenu}
                    className="block w-full text-center py-3 bg-red-600 text-white rounded-xl font-bold uppercase tracking-wider"
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-xl font-bold uppercase tracking-wider hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link 
                  to="/login" 
                  onClick={closeMobileMenu}
                  className="flex-1 text-center py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase tracking-wider"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={closeMobileMenu}
                  className="flex-1 text-center py-3 border-2 border-black dark:border-white rounded-xl font-bold uppercase tracking-wider"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-zinc-800">
            <button 
              onClick={toggleTheme}
              className="flex items-center justify-center gap-3 w-full py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold"
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default Header;
