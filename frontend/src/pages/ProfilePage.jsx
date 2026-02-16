import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaBoxOpen, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../store/authSlice';

const ProfilePage = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [sortedOrders, setSortedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            const fetchMyOrders = async () => {
                try {
                    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/myorders`, {
                        headers: { Authorization: `Bearer ${userInfo.token}` }
                    });
                    setOrders(data);
                    setLoading(false);
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to load orders');
                    setLoading(false);
                }
            };
            fetchMyOrders();
        }
    }, [userInfo, navigate]);

    // Sort orders based on selected sort option
    useEffect(() => {
        let sorted = [...orders];
        switch(sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'highest-price':
                sorted.sort((a, b) => b.totalPrice - a.totalPrice);
                break;
            case 'lowest-price':
                sorted.sort((a, b) => a.totalPrice - b.totalPrice);
                break;
            default:
                break;
        }
        setSortedOrders(sorted);
    }, [orders, sortBy]);

    const logoutHandler = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className="pt-20 sm:pt-24 pb-12 sm:pb-20 min-h-screen bg-white dark:bg-deep-void transition-colors">
            <div className="container mx-auto px-4 sm:px-6">
                
                <div className="flex flex-col md:flex-row gap-6 sm:gap-12">
                    
                    {/* LEFT: USER INFO */}
                    <div className="md:w-1/3 space-y-6">
                        <div className="bg-gray-50 dark:bg-zinc-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl md:sticky md:top-24">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 mx-auto">
                                <FaUser />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-center uppercase tracking-tight mb-1 sm:mb-2">
                                {userInfo?.name}
                            </h2>
                            <p className="text-center text-gray-500 text-sm sm:text-base mb-6 sm:mb-8">{userInfo?.email}</p>
                            
                            <div className="border-t border-gray-200 dark:border-zinc-800 py-4 sm:py-6">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-xs sm:text-sm text-gray-500 uppercase">Role</span>
                                    <span className="font-black text-xs sm:text-sm uppercase">{userInfo?.role === 'admin' || userInfo?.role === 'superadmin' ? 'Admin' : 'Member'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-xs sm:text-sm text-gray-500 uppercase">Joined</span>
                                    <span className="font-black text-xs sm:text-sm">{new Date().getFullYear()}</span>
                                </div>
                            </div>

                            <button 
                                onClick={logoutHandler}
                                className="w-full py-2.5 sm:py-3 bg-red-600 text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaSignOutAlt /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: ORDERS */}
                    <div className="md:w-2/3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex flex-wrap items-center gap-2 sm:gap-3">
                                <FaBoxOpen className="text-red-600" /> Order History <span className="text-gray-400 text-base sm:text-xl">({orders.length})</span>
                            </h2>
                            
                            {orders.length > 0 && (
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 sm:px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 border-none focus:ring-2 ring-black dark:ring-white outline-none font-bold text-xs sm:text-sm uppercase tracking-wide"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="highest-price">Highest Price</option>
                                    <option value="lowest-price">Lowest Price</option>
                                </select>
                            )}
                        </div>

                        {loading ? (
                            <p className="font-bold animate-pulse">Loading orders...</p>
                        ) : orders.length === 0 ? (
                            <div className="bg-gray-50 dark:bg-zinc-900 p-8 sm:p-12 rounded-2xl sm:rounded-3xl text-center">
                                <p className="font-bold text-lg sm:text-xl mb-4">You haven't placed any orders yet.</p>
                                <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold uppercase text-xs sm:text-sm">
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 sm:space-y-6">
                                {sortedOrders.map(order => (
                                    <div key={order._id} className="bg-gray-50 dark:bg-zinc-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                                        <div className="flex justify-between items-start mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 dark:border-zinc-800">
                                            <div>
                                                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Order ID</p>
                                                <p className="font-mono font-bold text-[10px] sm:text-sm break-all">#{order._id.slice(-8)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Date</p>
                                                <p className="font-bold text-xs sm:text-sm">{order.createdAt.substring(0, 10)}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                            {order.orderItems.map((item, index) => (
                                                <div key={index} className="flex gap-3 sm:gap-4 items-center">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-black rounded-lg p-1 sm:p-2 flex items-center justify-center flex-shrink-0">
                                                        <img 
                                                           src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`} 
                                                           alt={item.name} 
                                                           className="max-w-full max-h-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-xs sm:text-sm uppercase truncate">{item.name}</h4>
                                                        <p className="text-[10px] sm:text-xs text-gray-500">Size: {item.size} | Qty: {item.qty}</p>
                                                    </div>
                                                    <p className="font-bold text-xs sm:text-sm flex-shrink-0">₹{item.price}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-zinc-800">
                                            <div>
                                                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Total Amount</p>
                                                <p className="font-black text-lg sm:text-xl">₹{order.totalPrice}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {order.isPaid ? 'Paid' : 'Unpaid'}
                                                </span>
                                                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase ${
                                                    order.status === 'Delivered' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                                <button 
                                                    onClick={() => navigate(`/order/${order._id}`)}
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-[10px] sm:text-xs font-bold uppercase hover:opacity-80 transition-opacity"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;