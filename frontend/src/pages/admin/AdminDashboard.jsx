import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const location = useLocation();

    // Socket.io connection for real-time alerts
    useEffect(() => {
        // Connect to the root URL (where the backend is serving)
        const socket = io(import.meta.env.VITE_API_URL);
        
        socket.on('connect', () => {
            console.log('Connected to socket server for Admin');
            socket.emit('join_room', 'admin'); 
        });

        socket.on('new_order_placed', (data) => {
            toast.info(`🔔 New Order! Value: ₹${data.amount}`, {
                position: "top-right",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        });

        return () => {
            socket.disconnect();
        }
    }, []);

    const isActive = (path) => location.pathname.includes(path);

    return (
        <div className="pt-24 px-6 md:px-10 min-h-screen bg-gray-100 dark:bg-deep-void text-gray-800 dark:text-white">
            <h1 className="text-4xl font-black uppercase mb-8 ml-2">Admin Panel</h1>
            
            <div className="flex gap-6 mb-8 border-b border-gray-300 dark:border-gray-700 pb-0">
                <Link 
                    to="/admin/dashboard/orders" 
                    className={`text-lg font-bold px-4 py-2 border-b-2 transition-colors ${isActive('orders') ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Orders
                </Link>
                <Link 
                    to="/admin/dashboard/products" 
                    className={`text-lg font-bold px-4 py-2 border-b-2 transition-colors ${isActive('products') ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Products
                </Link>
                <Link 
                    to="/admin/dashboard/users" 
                    className={`text-lg font-bold px-4 py-2 border-b-2 transition-colors ${isActive('users') ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Admins
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 min-h-[500px] rounded-lg p-6 shadow-sm">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminDashboard;
