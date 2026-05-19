import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetStep, setIsResetStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo.name) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, { email, password });
        dispatch(setCredentials({ ...res.data }));
        navigate(redirect);
    } catch (err) {
        toast.error(err?.response?.data?.message || err.message);
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

  const sendForgotPasswordOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/send-otp`, { 
        email, 
        type: 'FORGOT_PASSWORD' 
      });
      toast.success(res.data.message);
      setIsResetStep(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const resetPasswordHandler = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/reset-password`, { 
        email, 
        otp, 
        newPassword 
      });
      toast.success(res.data.message);
      
      // Reset back to normal login
      setIsForgotPassword(false);
      setIsResetStep(false);
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-deep-void px-4 py-20">
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-xl sm:rounded-lg shadow-lg w-full max-w-md">
        
        {/* ===================== FORGOT PASSWORD FLOW ===================== */}
        {isForgotPassword ? (
          <>
             {isResetStep ? (
               <>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white">Reset Password</h1>
                  <p className="text-center text-sm text-gray-500 mb-6">Enter the OTP sent to {email} and your new password.</p>
                  <form onSubmit={resetPasswordHandler}>
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">6-Digit OTP</label>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white font-bold py-3 sm:py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base mb-4"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setIsResetStep(false); }}
                      className="w-full text-gray-500 hover:text-black dark:hover:text-white text-sm font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
               </>
             ) : (
               <>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white">Recover Account</h1>
                  <p className="text-center text-sm text-gray-500 mb-6">Enter your registered email address to receive an OTP.</p>
                  <form onSubmit={sendForgotPasswordOtp}>
                    <div className="mb-6">
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
                    <button
                      type="submit"
                      className="w-full bg-black text-white dark:bg-white dark:text-black font-bold py-3 sm:py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base mb-4"
                    >
                      Send OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="w-full text-gray-500 hover:text-black dark:hover:text-white text-sm font-bold transition-colors"
                    >
                      Back to Login
                    </button>
                  </form>
               </>
             )}
          </>
        ) : (
          /* ===================== STANDARD LOGIN FLOW ===================== */
          <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Sign In</h1>
            
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
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                   <label className="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold">Password</label>
                   <button 
                     type="button" 
                     onClick={() => setIsForgotPassword(true)}
                     className="text-xs text-blue-500 hover:text-blue-700 font-bold transition-colors"
                   >
                     Forgot Password?
                   </button>
                </div>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white dark:bg-white dark:text-black font-bold py-3 sm:py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                Sign In
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">New Customer? </span>
                <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="text-blue-500 hover:text-blue-700 font-bold">
                    Register
                </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
