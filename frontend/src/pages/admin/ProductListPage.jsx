import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
            setProducts(data);
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                toast.error(error.response?.data?.message || error.message);
            }
        }
    };

    const createProductHandler = async () => {
        if(window.confirm('Create new placeholder product?')) {
             try {
                // Create a dummy product that the admin can edit later
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/products`, 
                    {
                         name: 'Sample Product',
                         price: 0,
                         description: 'Sample Description',
                         category: 'Sample Category',
                         images: {
                             front: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
                             side: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
                             back: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
                         },
                         sizes: [{ size: 'UK 7', quantity: 0 }]
                    },
                    { headers: { Authorization: `Bearer ${userInfo.token}` } }
                );
                toast.success('Product Created');
                fetchProducts(); // Refresh list
             } catch (error) {
                toast.error(error.response?.data?.message || error.message);
             }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Products</h2>
                <button
                    onClick={createProductHandler}
                    className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded font-bold hover:opacity-80"
                >
                    <FaPlus /> Create Product
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-zinc-900 rounded shadow">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-zinc-800 text-left text-sm uppercase tracking-wider">
                            <th className="p-4 rounded-tl-lg">IMAGE</th>
                            <th className="p-4">NAME</th>
                            <th className="p-4">STOCK</th>
                            <th className="p-4">PRICE</th>
                            <th className="p-4">CATEGORY</th>
                            <th className="p-4 rounded-tr-lg">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            const totalStock = product.sizes?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0;
                            return (
                                <tr key={product._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                    <td className="p-4">
                                         <img 
                                            src={product.images?.front?.startsWith('http') ? product.images.front : `${import.meta.env.VITE_API_URL}${product.images?.front}`} 
                                            alt={product.name} 
                                            className="w-12 h-12 object-cover rounded"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                                        />
                                    </td>
                                    <td className="p-4 font-semibold">{product.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${totalStock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {totalStock} in stock
                                        </span>
                                    </td>
                                    <td className="p-4">₹{product.price}</td>
                                <td className="p-4">{product.category}</td>
                                    <td className="p-4 flex gap-4">
                                        <Link to={`/admin/dashboard/product/${product._id}/edit`} className="text-blue-500 hover:text-blue-700">
                                            <FaEdit />
                                        </Link>
                                        <button 
                                            onClick={() => deleteHandler(product._id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductListPage;
