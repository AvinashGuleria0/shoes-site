import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    
    // Loading and OTP Verification State
    const [loading, setLoading] = useState(false);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otp, setOtp] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const redirect = sp.get('redirect') || '/';
  
    const { userInfo } = useSelector((state) => state.auth);
  
    useEffect(() => {
      // If user is somehow already fully logged in (has token and name)
      if (userInfo && userInfo.name) {
        navigate(redirect);
      }
    }, [navigate, redirect, userInfo]);
  
    const submitHandler = async (e) => {
      e.preventDefault();
      if(password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
      }
      setLoading(true);
      try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, { name, email, password, phone });
            toast.success(res.data.message);
            setIsOtpStep(true);
      } catch (err) {
            toast.error(err?.response?.data?.message || err.message);
      } finally {
            setLoading(false);
      }
    };

    const verifyOtpHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/verify-otp`, { 
                email, 
                otp, 
                type: 'VERIFY_EMAIL' 
            });
            dispatch(setCredentials({ ...res.data }));
            toast.success('Account verified successfully!');
            navigate(redirect);
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const googleSuccess = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/google`, { token: credential });
            dispatch(setCredentials({ ...res.data }));
            navigate(redirect);
        } catch (error) {
            toast.error('Google Auth Failed');
        }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-deep-void px-4 py-20">
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-xl sm:rounded-lg shadow-lg w-full max-w-md">
        
        {isOtpStep ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white">Verify Account</h1>
            <p className="text-center text-sm text-gray-500 mb-6">Enter the 6-digit OTP sent to your email.</p>
            <form onSubmit={verifyOtpHandler}>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">One-Time Password</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-center text-xl tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white font-bold py-3 sm:py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Register</h1>
            
            {/* GOOGLE AUTH */}
            <div className="flex justify-center mb-6">
                <GoogleLogin
                    onSuccess={googleSuccess}
                    onError={() => {
                       toast.error('Google Sign In Failed');
                    }}
                    theme="filled_black"
                    shape="pill"
                />
            </div>
            
            <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
                <span className="px-3 text-gray-500 text-xs sm:text-sm">Or with email</span>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
            </div>

            <form onSubmit={submitHandler}>
              <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
              </div>
              <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
              </div>
              <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">WhatsApp Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="E.g. 9876543210"
                    className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
              </div>
              <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
              </div>
              <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
              </div>
              <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white dark:bg-white dark:text-black font-bold py-3 sm:py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm sm:text-base flex items-center justify-center gap-2"
              >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </>
                  ) : (
                    'Register'
                  )}
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-blue-500 hover:text-blue-700 font-bold">
                    Login
                </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
