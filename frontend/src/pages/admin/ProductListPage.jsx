import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { SkeletonTable } from '../../components/Skeleton';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let temp = products;
        if (searchTerm) {
            temp = temp.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (categoryFilter !== 'All') {
            temp = temp.filter(p => p.category === categoryFilter);
        }
        setFilteredProducts(temp);
    }, [searchTerm, categoryFilter, products]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
            setProducts(data);
            setFilteredProducts(data);
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const categories = ['All', ...new Set(products.map(p => p.category))];

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
                         brand: 'Sample Brand',
                         color: 'Sample Color',
                         material: 'Sample Material',
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
        <div className="pb-12 sm:pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight">Products</h2>
                
                <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-64 min-w-[120px] sm:min-w-[150px]">
                        <FaSearch className="absolute left-2 sm:left-3 top-2 sm:top-2.5 text-gray-400 text-xs sm:text-sm" />
                        <input 
                            type="text" 
                            placeholder="Search product..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 border-none focus:ring-2 ring-black dark:ring-white outline-none text-sm"
                        />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-2.5 sm:top-3 text-gray-400 text-sm" />
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="pl-9 sm:pl-10 pr-6 sm:pr-8 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 border-none focus:ring-2 ring-black dark:ring-white outline-none appearance-none cursor-pointer font-bold text-sm"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={createProductHandler}
                        className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-3 sm:px-4 py-2 rounded-lg font-bold text-sm hover:opacity-80 transition-opacity"
                    >
                        <FaPlus /> <span className="hidden sm:inline">Create</span>
                    </button>
                </div>
            </div>

            {loading ? (
                 <SkeletonTable rows={5} cols={5} />
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 sm:py-20 bg-gray-50 dark:bg-zinc-900 rounded-2xl sm:rounded-3xl">
                    <p className="text-gray-400 font-bold">No products found.</p>
                </div>
            ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700">
                    <table className="min-w-full w-full">
                        <thead className="bg-gray-50 dark:bg-black">
                            <tr className="text-left text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-gray-500">
                                <th className="p-2 sm:p-3 md:p-4 whitespace-nowrap">Product</th>
                                <th className="p-2 sm:p-3 md:p-4 hidden sm:table-cell whitespace-nowrap">Stock</th>
                                <th className="p-2 sm:p-3 md:p-4 whitespace-nowrap">Price</th>
                                <th className="p-2 sm:p-3 md:p-4 hidden md:table-cell whitespace-nowrap">Category</th>
                                <th className="p-2 sm:p-3 md:p-4 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {filteredProducts.map(product => {
                                const totalStock = product.sizes?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0;
                                return (
                                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="p-2 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-4">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white dark:bg-black p-1 rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <img 
                                                   src={product.images?.side?.startsWith('http') ? product.images.side : `${import.meta.env.VITE_API_URL}${product.images?.side}`} 
                                                   alt={product.name} 
                                                   className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                            <span className="font-bold text-[10px] sm:text-xs md:text-sm tracking-tight truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">{product.name}</span>
                                        </td>
                                        <td className="p-2 sm:p-3 md:p-4 hidden sm:table-cell">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                                                totalStock === 0 ? 'bg-red-100 text-red-600' :
                                                totalStock < 10 ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                                {totalStock === 0 ? 'Out' : `${totalStock}`}
                                            </span>
                                        </td>
                                        <td className="p-2 sm:p-3 md:p-4 font-black text-[10px] sm:text-xs md:text-sm whitespace-nowrap">₹{product.price}</td>
                                        <td className="p-2 sm:p-3 md:p-4 hidden md:table-cell">
                                            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">{product.category}</span>
                                        </td>
                                        <td className="p-2 sm:p-3 md:p-4">
                                            <div className="flex gap-1 sm:gap-2">
                                                <Link 
                                                    to={`/admin/dashboard/product/${product._id}/edit`}
                                                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                                >
                                                    <FaEdit size={10} className="sm:w-3 sm:h-3" />
                                                </Link>
                                                <button 
                                                    onClick={() => deleteHandler(product._id)}
                                                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <FaTrash size={10} className="sm:w-3 sm:h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>
    );
};

export default ProductListPage;
