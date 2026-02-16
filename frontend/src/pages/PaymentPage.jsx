import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../store/cartSlice';
import { FaCreditCard, FaWallet, FaMoneyBillWave } from 'react-icons/fa';

const PaymentPage = () => {
    const cart = useSelector((state) => state.cart);
    const { shippingAddress } = cart;
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (!shippingAddress.address) {
        navigate('/shipping');
    }
  
    const submitHandler = (e) => {
      e.preventDefault();
      dispatch(savePaymentMethod(paymentMethod));
      navigate('/placeorder');
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-deep-void pt-20 px-4 sm:px-6">
      <div className="bg-white dark:bg-zinc-900 p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase mb-6 sm:mb-8 text-center text-gray-800 dark:text-white tracking-tight">Payment Method</h1>
        
        <form onSubmit={submitHandler} className="space-y-6">
          
          {/* RAZORPAY - PRIMARY */}
          <label className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all ${
            paymentMethod === 'Razorpay' 
            ? 'border-black dark:border-white bg-black/5 dark:bg-white/5' 
            : 'border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="Razorpay"
              checked={paymentMethod === 'Razorpay'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 accent-black dark:accent-white"
            />
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <FaCreditCard className="text-xl sm:text-2xl text-blue-600" />
              <div>
                <p className="font-bold text-base sm:text-lg">Razorpay</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Credit Card, Debit Card, UPI, Netbanking</p>
              </div>
            </div>
          </label>

          {/* COD */}
          <label className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all ${
            paymentMethod === 'COD' 
            ? 'border-black dark:border-white bg-black/5 dark:bg-white/5' 
            : 'border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 accent-black dark:accent-white"
            />
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <FaMoneyBillWave className="text-xl sm:text-2xl text-green-600" />
              <div>
                <p className="font-bold text-base sm:text-lg">Cash on Delivery</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Pay when you receive your order</p>
              </div>
            </div>
          </label>

          {/* UPI DIRECT (Optional Future Feature) */}
          <label className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all opacity-50 ${
            paymentMethod === 'UPI' 
            ? 'border-black dark:border-white bg-black/5 dark:bg-white/5' 
            : 'border-gray-200 dark:border-zinc-800'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="UPI"
              disabled
              className="w-5 h-5 accent-black dark:accent-white"
            />
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <FaWallet className="text-xl sm:text-2xl text-purple-600" />
              <div>
                <p className="font-bold text-base sm:text-lg">UPI Direct <span className="text-[10px] sm:text-xs text-gray-400">(Coming Soon)</span></p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Pay via GPay, PhonePe, Paytm</p>
              </div>
            </div>
          </label>

          <button
            type="submit"
            className="w-full bg-black text-white dark:bg-white dark:text-black font-black py-4 px-6 rounded-full uppercase tracking-widest text-lg hover:opacity-90 transition-all transform active:scale-95"
          >
            Continue to Review Order
          </button>

          <button
            type="button"
            onClick={() => navigate('/shipping')}
            className="w-full text-center text-gray-500 hover:text-black dark:hover:text-white underline text-sm"
          >
            ← Back to Shipping
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
