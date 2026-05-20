import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { SkeletonOrderDetails } from '../../components/Skeleton';
import { FaArrowLeft, FaBox, FaUser, FaCreditCard, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaTruck } from 'react-icons/fa';

const OrderDetailsPage = () => {
    const { id: orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [cancellationNote, setCancellationNote] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

    const { userInfo } = useSelector(state => state.auth);

    const updateStatusHandler = async (status) => {
        // If marking as delivered and order is unpaid, show payment modal first
        if (status === 'Delivered' && !order.isPaid) {
            setShowPaymentModal(true);
            return;
        }

        setStatusLoading(true);
        try {
            const { data } = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
                { status, cancellationNote: status === 'Cancelled' ? cancellationNote : undefined },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            setOrder(data);
            toast.success(`Order status updated to ${status}`);
            setShowCancelModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setStatusLoading(false);
        }
    };

    const confirmPaymentAndDeliver = async () => {
        if (!selectedPaymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        setStatusLoading(true);
        try {
            // First mark as paid with the selected payment method
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/pay`,
                { paymentMethod: selectedPaymentMethod },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            // Then update status to delivered
            const { data: deliveredOrder } = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
                { status: 'Delivered' },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            setOrder(deliveredOrder);
            toast.success('Payment confirmed and order marked as delivered!');
            setShowPaymentModal(false);
            setSelectedPaymentMethod('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setStatusLoading(false);
        }
    };

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

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <SkeletonOrderDetails />
            </div>
        );
    }
    if (!order) return <div className="p-10 text-center font-bold text-red-500">Order not found.</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/admin/dashboard/orders" className="flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white mb-6">
                <FaArrowLeft /> Back to Orders
            </Link>

            <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Order Detail</h1>
                    <p className="text-sm font-mono text-gray-400 mt-1">ID: {order._id}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 font-bold uppercase">Date Placed</p>
                    <p className="text-lg font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* USER INFO */}
                <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4 text-gray-400">
                        <FaUser className="text-blue-500" /> Customer
                    </h3>
                    <p className="font-bold text-lg">{order.userId?.name}</p>
                    <p className="text-gray-500">{order.userId?.email}</p>
                </div>

                {/* STATUS INFO */}
                <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4 text-gray-400">
                        <FaCreditCard className="text-green-500" /> Payment & Status
                    </h3>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Method: <span className="text-black dark:text-white font-bold">{order.paymentMethod}</span></span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${order.isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                    </div>
                    {order.isPaid && <p className="text-xs text-green-500 mt-2 font-bold">Paid on {new Date(order.paidAt).toLocaleString()}</p>}
                </div>

                {/* SHIPPING INFO */}
                <div className="md:col-span-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4 text-gray-400">
                        <FaMapMarkerAlt className="text-red-500" /> Shipping Address
                    </h3>
                    <p className="font-bold">{order.shippingAddress?.address}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                    <p>{order.shippingAddress?.country}</p>
                </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 rounded-xl shadow-sm mb-10">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-6 text-gray-400 border-b dark:border-zinc-800 pb-4">
                    <FaBox className="text-orange-500" /> Order Items
                </h3>
                <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center border-b dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                            <div className="flex gap-4 items-center">
                                <img 
                                    src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`} 
                                    alt={item.name} 
                                    className="w-16 h-16 object-cover rounded bg-gray-100"
                                />
                                <div>
                                    <p className="font-black text-lg leading-tight">{item.name}</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Size: {item.size || 'N/A'}</p>
                                    <p className="text-sm">Qty: {item.qty}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-lg">₹{item.price}</p>
                                <p className="text-xs text-gray-500 font-bold uppercase">Total</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* TOTAL SUMMARY */}
            <div className="bg-black text-white p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 mb-10 text-center md:text-left">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Total Order Value</p>
                    <p className="text-4xl font-black italic tracking-tighter">₹{order.totalPrice.toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                     {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <>
                            <button 
                                onClick={() => updateStatusHandler('Shipped')}
                                disabled={statusLoading || order.status === 'Shipped'}
                                className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <FaTruck /> Mark Shipped
                            </button>
                            <button 
                                onClick={() => updateStatusHandler('Delivered')}
                                disabled={statusLoading}
                                className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <FaCheckCircle /> Mark Delivered
                            </button>
                            <button 
                                onClick={() => setShowCancelModal(true)}
                                disabled={statusLoading}
                                className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                <FaTimesCircle /> Cancel Order
                            </button>
                        </>
                     )}
                     {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                        <div className="text-sm font-bold opacity-60 uppercase tracking-widest">
                            Order is {order.status}
                        </div>
                     )}
                </div>
            </div>

            {order.cancellationNote && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-6 rounded-xl mb-10">
                    <h3 className="text-red-600 dark:text-red-400 font-bold uppercase text-xs mb-2">Cancellation Reason</h3>
                    <p className="italic">"{order.cancellationNote}"</p>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-8 rounded-2xl">
                        <h2 className="text-2xl font-black uppercase mb-4">Cancel Order</h2>
                        <p className="text-gray-500 mb-6 font-medium">Please provide a reason for cancelling this order. This will be visible to the customer.</p>
                        <textarea 
                            value={cancellationNote}
                            onChange={(e) => setCancellationNote(e.target.value)}
                            className="w-full p-4 border dark:border-zinc-800 rounded-xl mb-6 dark:bg-black h-32 outline-none focus:ring-2 ring-red-500/50"
                            placeholder="Reason for cancellation..."
                        />
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-3 font-bold border dark:border-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => updateStatusHandler('Cancelled')}
                                disabled={!cancellationNote || statusLoading}
                                className="flex-1 py-3 font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {statusLoading ? 'Processing...' : 'Cancel Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Confirmation Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-8 rounded-2xl">
                        <h2 className="text-2xl font-black uppercase mb-4">Confirm Payment</h2>
                        <p className="text-gray-500 mb-6 font-medium">This order is unpaid. Please confirm the payment method received before marking as delivered.</p>
                        
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => setSelectedPaymentMethod('Cash')}
                                className={`w-full p-4 rounded-xl font-bold text-left border-2 transition-all ${
                                    selectedPaymentMethod === 'Cash'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg font-black">Cash</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Cash on Delivery</div>
                                    </div>
                                    {selectedPaymentMethod === 'Cash' && (
                                        <FaCheckCircle className="text-green-500 text-xl" />
                                    )}
                                </div>
                            </button>

                            <button
                                onClick={() => setSelectedPaymentMethod('UPI')}
                                className={`w-full p-4 rounded-xl font-bold text-left border-2 transition-all ${
                                    selectedPaymentMethod === 'UPI'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg font-black">UPI</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">UPI Payment</div>
                                    </div>
                                    {selectedPaymentMethod === 'UPI' && (
                                        <FaCheckCircle className="text-green-500 text-xl" />
                                    )}
                                </div>
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setSelectedPaymentMethod('');
                                }}
                                className="flex-1 py-3 font-bold border dark:border-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmPaymentAndDeliver}
                                disabled={!selectedPaymentMethod || statusLoading}
                                className="flex-1 py-3 font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {statusLoading ? 'Processing...' : 'Confirm & Deliver'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailsPage;
