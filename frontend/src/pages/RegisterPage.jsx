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
  
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const redirect = sp.get('redirect') || '/';
  
    const { userInfo } = useSelector((state) => state.auth);
  
    useEffect(() => {
      if (userInfo) {
        navigate(redirect);
      }
    }, [navigate, redirect, userInfo]);
  
    const submitHandler = async (e) => {
      e.preventDefault();
      if(password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
      }
      try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, { name, email, password });
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-deep-void">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Register</h1>
        
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
            <span className="px-3 text-gray-500 text-sm">Or with email</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
        </div>

        <form onSubmit={submitHandler}>
        <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Name</label>
            <input
              type="text"
              placeholder="Enter name"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white dark:bg-white dark:text-black font-bold py-2 px-4 rounded hover:opacity-90 transition-opacity"
          >
            Register
          </button>
        </form>

        <div className="mt-4 text-center">
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-blue-500 hover:text-blue-700 font-bold">
                Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
