import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaBox, FaUser, FaCreditCard, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaTruck } from 'react-icons/fa';

const UserOrderDetailsPage = () => {
    const { id: orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setOrder(data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error fetching order');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, userInfo]);

    if (loading) return <div className="pt-32 text-center font-bold">Loading Order Details...</div>;
    if (!order) return <div className="pt-32 text-center font-bold text-red-500">Order Not Found</div>;

    return (
        <div className="pt-20 sm:pt-24 pb-12 sm:pb-20 min-h-screen bg-gray-50 dark:bg-deep-void text-gray-900 dark:text-white transition-colors">
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
                <Link to="/profile" className="inline-flex items-center gap-2 mb-6 sm:mb-8 text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
                    <FaArrowLeft /> Back to Profile
                </Link>

                <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800 mb-6 sm:mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-100 dark:border-zinc-800">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">Order #{order._id.substring(order._id.length - 8)}</h1>
                            <p className="text-xs sm:text-sm font-bold text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
                             <div className={`px-4 py-2 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 ${
                                order.status === 'Delivered' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'Cancelled' ? 'bg-gray-100 text-gray-600' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {order.status === 'Delivered' && <FaCheckCircle />}
                                {order.status === 'Cancelled' && <FaTimesCircle />}
                                {order.status === 'Processing' && <FaTruck />}
                                {order.status}
                            </div>
                            <div className={`px-4 py-2 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 ${
                                order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                <FaCreditCard /> {order.isPaid ? 'Paid' : 'Payment Pending'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-8">
                        <div>
                            <h3 className="font-bold uppercase text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 flex items-center gap-2">
                                <FaMapMarkerAlt /> Shipping Address
                            </h3>
                            <div className="bg-gray-50 dark:bg-black p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold leading-relaxed">
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-bold uppercase text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 flex items-center gap-2">
                                <FaCreditCard /> Payment Method
                            </h3>
                             <div className="bg-gray-50 dark:bg-black p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold">
                                <p className="uppercase">{order.paymentMethod}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {order.isPaid ? `Paid on ${order.paidAt.substring(0, 10)}` : 'Payment not yet received'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold uppercase text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 flex items-center gap-2">
                            <FaBox /> Order Items
                        </h3>
                        <div className="divide-y divide-gray-100 dark:divide-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-xl sm:rounded-2xl overflow-hidden">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 bg-gray-50 dark:bg-black/50 hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white dark:bg-zinc-800 rounded-lg p-1 sm:p-2 flex items-center justify-center border border-gray-100 dark:border-zinc-700 flex-shrink-0">
                                        <img 
                                            src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`} 
                                            alt={item.name} 
                                            className="max-w-full max-h-full object-contain" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Link to={`/product/${item.product}`} className="font-bold text-sm uppercase hover:text-red-500 transition-colors">
                                            {item.name}
                                        </Link>
                                        <p className="text-xs text-gray-500 font-bold mt-1">Size: {item.size}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">₹{item.price} x {item.qty}</p>
                                        <p className="font-black text-sm">₹{item.price * item.qty}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-zinc-800 mt-8 pt-8 flex justify-end">
                        <div className="w-full md:w-1/3 space-y-3">
                            <div className="flex justify-between text-sm font-bold text-gray-500">
                                <span>Items Total</span>
                                <span>₹{order.itemsPrice}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-500">
                                <span>Shipping</span>
                                <span>₹{order.shippingPrice}</span>
                            </div>
                             <div className="flex justify-between text-sm font-bold text-gray-500">
                                <span>Tax</span>
                                <span>₹{order.taxPrice}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black border-t border-gray-200 dark:border-zinc-700 pt-4">
                                <span>Total</span>
                                <span>₹{order.totalPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserOrderDetailsPage;