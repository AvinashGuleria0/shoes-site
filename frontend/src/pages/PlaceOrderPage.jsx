import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrderPage = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  // Calculate prices
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  const itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  
  // Shipping: Free if > 5000
  const shippingPrice = addDecimals(itemsPrice > 5000 ? 0 : 500); 
  const taxPrice = addDecimals(Number((0.18 * itemsPrice).toFixed(2))); // 18% GST
  const totalPrice = (
    Number(itemsPrice) +
    Number(shippingPrice) +
    Number(taxPrice)
  ).toFixed(2);

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    }
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.shippingAddress, cart.paymentMethod, navigate]);

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
  };

  const placeOrderHandler = async () => {
    try {
        // 1. Create Order in Backend
        const { data: order } = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/orders`,
            {
                orderItems: cart.cartItems.map(item => ({
                    ...item,
                    productId: item._id, // Backend expects productId
                    image: item.images?.side || item.image
                })),
                shippingAddress: cart.shippingAddress,
                paymentMethod: cart.paymentMethod,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            },
            {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            }
        );

        // 2. Handle COD (Cash on Delivery) - Skip Payment Gateway
        if (cart.paymentMethod === 'COD') {
            toast.success('Order Placed Successfully! Pay on delivery.', {
                position: "top-center",
                autoClose: 3000,
            });
            navigate('/');
            return;
        }

        // 3. Handle Razorpay Payment
        const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            return;
        }

        // 4. Open Razorpay Modal
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'placeholder', 
            amount: order.totalPrice * 100,
            currency: "INR",
            name: "KICKS.",
            description: `Order #${order._id}`,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
            order_id: order.razorpayOrderId, 
            handler: async function (response) {
                // 5. Verify Payment on Backend
                try {
                    await axios.put(
                        `${import.meta.env.VITE_API_URL}/api/orders/${order._id}/pay`,
                        {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${userInfo.token}`,
                            },
                        }
                    );
                    toast.success("Payment Successful!");
                    navigate('/');
                } catch (err) {
                    toast.error("Payment Verification Failed");
                }
            },
            prefill: {
                name: userInfo.name,
                email: userInfo.email,
                contact: userInfo.phone || "9999999999",
            },
            theme: {
                color: "#000000",
            },
        };

        // Check if we are in Mock Mode or Real Mode
        if (order.razorpayOrderId.startsWith('order_mock_')) {
             // Bypass Razorpay for Testing if no real Key
             toast.info("Mock Payment Mode - Auto Success");
             await axios.put(
                `${import.meta.env.VITE_API_URL}/api/orders/${order._id}/pay`,
                {
                    razorpay_payment_id: "mock_pay_id",
                    razorpay_order_id: order.razorpayOrderId,
                    razorpay_signature: "mock_sig",
                },
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                }
            );
            navigate('/');
        } else {
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        }

    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="pt-24 px-6 md:px-20 min-h-screen bg-gray-50 dark:bg-deep-void text-gray-800 dark:text-white pb-20">
      <h1 className="text-3xl font-black uppercase mb-8">Place Order</h1>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* LEFT COLUMN: DETAILS */}
        <div className="flex-1 space-y-6">
            
            {/* ADDRESS */}
             <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Shipping</h2>
                <p>
                    {cart.shippingAddress.address}, {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
                </p>
             </div>

             {/* PAYMENT METHOD */}
             <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <p className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-full text-sm font-bold uppercase">
                        {cart.paymentMethod}
                    </span>
                </p>
             </div>

             {/* ITEMS */}
             <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                {cart.cartItems.length === 0 ? <p>Cart is empty</p> : (
                    <div className="space-y-4">
                        {cart.cartItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                <div className="flex items-center gap-4">
                                    <img 
                                      src={item.images?.side?.startsWith('http') ? item.images.side : `${import.meta.env.VITE_API_URL}${item.images?.side}`} 
                                      alt={item.name} 
                                      className="w-12 h-12 object-contain"
                                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' }}
                                    />
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-xs text-gray-500">Size: {item.size}</p>
                                    </div>
                                </div>
                                <span className="font-bold">{item.qty} x ₹{item.price} = ₹{item.qty * item.price}</span>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="lg:w-1/3 bg-white dark:bg-zinc-900 p-8 rounded shadow h-fit">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between">
                    <span>Items</span>
                    <span>₹{itemsPrice}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shippingPrice}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax (18%)</span>
                    <span>₹{taxPrice}</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-2">
                    <span>Total</span>
                    <span>₹{totalPrice}</span>
                </div>
            </div>
            
            <button
                onClick={placeOrderHandler}
                className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest hover:opacity-90 rounded-full transition-all transform active:scale-95 text-lg"
            >
                {cart.paymentMethod === 'COD' ? 'Confirm Order' : 'Proceed to Payment'}
            </button>

            <button
                onClick={() => navigate('/payment')}
                className="w-full mt-3 text-center text-gray-500 hover:text-black dark:hover:text-white underline text-sm"
            >
                ← Change Payment Method
            </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
