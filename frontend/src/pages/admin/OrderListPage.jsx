import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const OrderListPage = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const { userInfo } = useSelector(state => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setOrders(data);
                setFilteredOrders(data);
            } catch (error) {
                toast.error(error.response?.data?.message || error.message);
            }
        };
        fetchOrders();
    }, [userInfo]);

    useEffect(() => {
        let tempOrders = orders;

        // 1. Search Filter (ID or User Name)
        if (searchTerm) {
            tempOrders = tempOrders.filter(order => 
                order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.userId && order.userId.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // 2. Status Filter
        if (statusFilter !== 'All') {
            if (statusFilter === 'Completed') {
                tempOrders = tempOrders.filter(order => order.status === 'Delivered');
            } else {
                tempOrders = tempOrders.filter(order => order.status === statusFilter);
            }
        }

        setFilteredOrders(tempOrders);
    }, [searchTerm, statusFilter, orders]);

    return (
        <div className="pb-20">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Order Management</h2>
                    
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search Order ID or User..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 border-none focus:ring-2 ring-black dark:ring-white outline-none"
                        />
                    </div>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setStatusFilter('All')}
                        className={`px-6 py-2 rounded-lg font-bold uppercase text-sm tracking-wide transition-all ${
                            statusFilter === 'All'
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter('Processing')}
                        className={`px-6 py-2 rounded-lg font-bold uppercase text-sm tracking-wide transition-all ${
                            statusFilter === 'Processing'
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        Processing
                    </button>
                    <button
                        onClick={() => setStatusFilter('Shipped')}
                        className={`px-6 py-2 rounded-lg font-bold uppercase text-sm tracking-wide transition-all ${
                            statusFilter === 'Shipped'
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        Shipped
                    </button>
                    <button
                        onClick={() => setStatusFilter('Completed')}
                        className={`px-6 py-2 rounded-lg font-bold uppercase text-sm tracking-wide transition-all ${
                            statusFilter === 'Completed'
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setStatusFilter('Cancelled')}
                        className={`px-6 py-2 rounded-lg font-bold uppercase text-sm tracking-wide transition-all ${
                            statusFilter === 'Cancelled'
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        Cancelled
                    </button>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-8 text-center">
                    <p className="font-bold text-gray-500">No orders found matching your criteria.</p>
                </div>
            ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-black">
                            <tr className="text-left text-xs font-black uppercase tracking-widest text-gray-500">
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Fulfillment</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {filteredOrders.map(order => (
                                <tr 
                                    key={order._id} 
                                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
                                >
                                    <td className="p-4 font-mono text-xs text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">#{order._id.substring(order._id.length - 6)}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-sm">{order.userId?.name || 'Deleted User'}</div>
                                        <div className="text-xs text-gray-400">{order.userId?.email}</div>
                                    </td>
                                    <td className="p-4 text-xs font-bold text-gray-500">{order.createdAt.substring(0, 10)}</td>
                                    <td className="p-4 font-black">₹{order.totalPrice}</td>
                                    <td className="p-4">
                                        {order.isPaid ? (
                                            <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-1 rounded-md">
                                                Paid
                                            </span>
                                        ) : (
                                            <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-1 rounded-md">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                                            order.status === 'Delivered' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'Cancelled' ? 'bg-gray-200 text-gray-600' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => navigate(`/admin/dashboard/order/${order._id}`)}
                                            className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>
    );
};

export default OrderListPage;
