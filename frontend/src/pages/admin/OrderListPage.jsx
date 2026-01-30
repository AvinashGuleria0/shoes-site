import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const OrderListPage = () => {
    const [orders, setOrders] = useState([]);
    const { userInfo } = useSelector(state => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setOrders(data);
            } catch (error) {
                toast.error(error.response?.data?.message || error.message);
            }
        };
        fetchOrders();
    }, [userInfo]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
            {orders.length === 0 ? <p>No orders found.</p> : (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-zinc-900 rounded shadow">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-zinc-800 text-left text-sm uppercase tracking-wider">
                            <th className="p-4 rounded-tl-lg">ID</th>
                            <th className="p-4">USER</th>
                            <th className="p-4">DATE</th>
                            <th className="p-4">TOTAL</th>
                            <th className="p-4">PAID</th>
                            <th className="p-4 rounded-tr-lg">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr 
                                key={order._id} 
                                onClick={() => navigate(`/admin/dashboard/order/${order._id}`)}
                                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <td className="p-4 font-mono text-xs">{order._id}</td>
                                <td className="p-4 font-semibold">{order.userId?.name || 'Deleted User'}</td>
                                <td className="p-4 text-sm text-gray-500">{order.createdAt.substring(0, 10)}</td>
                                <td className="p-4 font-bold">₹{order.totalPrice}</td>
                                <td className="p-4">
                                    {order.isPaid ? (
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded dark:bg-green-900 dark:text-green-300">
                                            {order.paidAt?.substring(0, 10)}
                                        </span>
                                    ) : (
                                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded dark:bg-red-900 dark:text-red-300">
                                            No
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className="text-sm font-medium">{order.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
};

export default OrderListPage;
