import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Dark Mode State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="fixed w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 text-gray-800 dark:text-white dark:bg-black/70 dark:border-white/10 shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="text-2xl font-black tracking-tighter uppercase">
          KICKS<span className="text-red-500">.</span>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="hidden md:flex items-center space-x-8 font-bold uppercase tracking-widest text-sm">
          <Link to="/" className="hover:text-red-500 transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-red-500 transition-colors">Shop</Link>
          <Link to="/cart" className="hover:text-red-500 transition-colors">Cart</Link>
        </div>

        {/* ICONS */}
        <div className="flex items-center space-x-6">
          <button onClick={toggleTheme} className="hover:text-red-500 transition-colors">
            {theme === 'dark' ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
          </button>

          <Link to="/cart" className="relative group">
            <FaShoppingCart className="text-xl group-hover:text-red-500 transition-colors" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
              </span>
            )}
          </Link>

          {userInfo ? (
            <div className="flex items-center gap-4">
              {/* ADMIN LINK */}
              {(userInfo.role === 'admin' || userInfo.role === 'superadmin') && (
                <Link to="/admin" className="text-[10px] font-black bg-red-600 text-white px-2 py-1 rounded tracking-tighter hover:bg-red-700 transition-all">
                  ADMIN PANEL
                </Link>
              )}
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] uppercase text-gray-500 font-bold leading-none">Welcome</span>
                <span className="text-xs font-black">{userInfo.name.split(' ')[0]}</span>
              </div>
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
        </div>
      </nav>
    </header>
  );
};

export default Header;
