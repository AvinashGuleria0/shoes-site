import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaUserShield, FaPlus } from 'react-icons/fa';

const ManageAdminsPage = () => {
    const [admins, setAdmins] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/admins`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setAdmins(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch admins');
        }
    };

    const addAdminHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users/admin`,
                { name, email, password },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            toast.success('Admin added successfully');
            setName('');
            setEmail('');
            setPassword('');
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-gray-50 dark:bg-zinc-800 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaUserShield className="text-blue-500" /> Add New Admin
                    </h3>
                    <form onSubmit={addAdminHandler} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">New users will use this password. Existing users will be upgraded.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black p-3 rounded font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                            <FaPlus /> {loading ? 'Adding...' : 'Add Admin'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">Current Admins</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-zinc-900 rounded shadow">
                        <thead>
                            <tr className="bg-gray-200 dark:bg-zinc-800 text-left text-sm uppercase tracking-wider">
                                <th className="p-4 rounded-tl-lg">NAME</th>
                                <th className="p-4">EMAIL</th>
                                <th className="p-4 rounded-tr-lg">ROLE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                    <td className="p-4 font-semibold">{admin.name}</td>
                                    <td className="p-4">{admin.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${admin.role === 'superadmin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                                            {admin.role.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageAdminsPage;
