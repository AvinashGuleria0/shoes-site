import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaMagic, FaSave, FaImage, FaUpload } from 'react-icons/fa';

const ProductEditPage = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [color, setColor] = useState('');
    const [material, setMaterial] = useState('');
    const [sizes, setSizes] = useState([{ size: '', quantity: 0 }]);
    
    // Image Angles
    const [imageFront, setImageFront] = useState('');
    const [imageSide, setImageSide] = useState('');
    const [imageBack, setImageBack] = useState('');
    
    const [uploading, setUploading] = useState(false);
    const [removingBg, setRemovingBg] = useState(false);

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${productId}`);
                setName(data.name);
                setPrice(data.price);
                setDescription(data.description);
                setCategory(data.category);
                setBrand(data.brand || '');
                setColor(data.color || '');
                setMaterial(data.material || '');
                setSizes(data.sizes && data.sizes.length > 0 ? data.sizes : [{ size: '', quantity: 0 }]);
                if (data.images) {
                    setImageFront(data.images.front || '');
                    setImageSide(data.images.side || '');
                    setImageBack(data.images.back || '');
                }
            } catch (error) {
                toast.error(error.message);
            }
        };
        fetchProduct();
    }, [productId]);

    const addSizeHandler = () => {
        setSizes([...sizes, { size: '', quantity: 0 }]);
    };

    const removeSizeHandler = (index) => {
        const newSizes = sizes.filter((_, i) => i !== index);
        setSizes(newSizes.length > 0 ? newSizes : [{ size: '', quantity: 0 }]);
    };

    const sizeChangeHandler = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = value;
        setSizes(newSizes);
    };

    const uploadFileHandler = async (e, setImageFunction, removeBg = false) => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);
      
      if (removeBg) {
          setRemovingBg(true);
      } else {
          setUploading(true);
      }

      try {
        const url = removeBg 
            ? `${import.meta.env.VITE_API_URL}/api/upload/removebg`
            : `${import.meta.env.VITE_API_URL}/api/upload`;

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };

        const { data } = await axios.post(url, formData, config);
        setImageFunction(data);
        
        if (removeBg) {
            toast.success('Background Removed & Image Uploaded!');
            setRemovingBg(false);
        } else {
            setUploading(false);
        }

      } catch (error) {
        console.error(error);
        const errMsg = error.response?.data?.message || error.message;
        if (removeBg) {
            toast.error(`Background removal failed: ${errMsg}`);
            setRemovingBg(false);
        } else {
            toast.error(`Image upload failed: ${errMsg}`);
            setUploading(false);
        }
      }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (!imageFront || !imageSide || !imageBack) {
            toast.error('Please upload all three required product images');
            return;
        }

        const validSizes = sizes.filter(s => s.size.trim() !== '');
        if (validSizes.length === 0) {
            toast.error('Please add at least one valid size');
            return;
        }

        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/products/${productId}`,
                {
                    name,
                    price: Number(price),
                    description,
                    category,
                    brand,
                    color,
                    material,
                    sizes: validSizes.map(s => ({
                        size: s.size,
                        quantity: Number(s.quantity)
                    })),
                    images: { front: imageFront, side: imageSide, back: imageBack }
                },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            toast.success('Product Updated Successfully');
            navigate('/admin/dashboard/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed. Check if all required fields are filled.');
        }
    };

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-6">
                <Link to="/admin/dashboard/products" className="flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors font-bold">
                    <FaArrowLeft /> Back
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tight">Edit Product</h1>
            </div>
            
            <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: IMAGES */}
                <div className="lg:col-span-1 space-y-6">
                     <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <FaImage /> Product Images
                        </h3>
                        <p className="text-xs text-gray-400 mb-6">Upload 3 angles for the 3D scroll effect. Use "Remove BG" for transparent PNGs.</p>
                        
                        {[
                            { label: 'Side Angle (Main)', val: imageSide, set: setImageSide },
                            { label: 'Front Angle', val: imageFront, set: setImageFront },
                            { label: 'Back Angle', val: imageBack, set: setImageBack }
                        ].map((field, idx) => (
                            <div key={idx} className="mb-6 p-4 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-zinc-800">
                                <label className="block text-xs font-bold uppercase mb-2 text-gray-500">{field.label}</label>
                                
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden border">
                                        {field.val ? (
                                            <img src={field.val.startsWith('http') ? field.val : `${import.meta.env.VITE_API_URL}${field.val}`} className="w-full h-full object-contain" alt="" />
                                        ) : (
                                            <FaImage className="text-gray-300" />
                                        )}
                                    </div>
                                    <input 
                                        type="text" 
                                        value={field.val} 
                                        onChange={(e) => field.set(e.target.value)}
                                        placeholder="Image URL"
                                        className="flex-1 bg-transparent border-b border-gray-300 dark:border-zinc-700 text-sm focus:border-black dark:focus:border-white outline-none p-1"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <label className="flex-1 cursor-pointer bg-black text-white dark:bg-white dark:text-black py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
                                        <FaUpload /> Upload
                                        <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, field.set, false)} />
                                    </label>
                                    <label className="flex-1 cursor-pointer bg-purple-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors">
                                        <FaMagic /> Remove BG
                                        <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, field.set, true)} disabled={removingBg} />
                                    </label>
                                </div>
                            </div>
                        ))}
                        {(uploading || removingBg) && <p className="text-center text-xs font-bold animate-pulse text-blue-500">Processing Image...</p>}
                     </div>
                </div>

                {/* RIGHT COLUMN: DETAILS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:ring-2 ring-black dark:ring-white outline-none font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:ring-2 ring-black dark:ring-white outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:ring-2 ring-black dark:ring-white outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Brand</label>
                                <input
                                    type="text"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    placeholder="e.g. Nike, Adidas"
                                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:ring-2 ring-black dark:ring-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Color</label>
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="e.g. Black, Red"
                                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:ring-2 ring-black dark:ring-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Material</label>
                                <input
                                    type="text"
                                    value={material}
                                    onChange={(e) => setMaterial(e.target.value)}
                                    placeholder="e.g. Leather, Suede"
                                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:ring-2 ring-black dark:ring-white outline-none"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:ring-2 ring-black dark:ring-white outline-none h-32"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Inventory & Sizes</label>
                            <div className="bg-gray-50 dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                                {sizes.map((s, index) => (
                                    <div key={index} className="flex gap-4 mb-3 items-center">
                                        <input
                                            type="text"
                                            value={s.size}
                                            onChange={(e) => sizeChangeHandler(index, 'size', e.target.value)}
                                            className="w-24 p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700 text-center font-bold"
                                            placeholder="Size"
                                        />
                                        <input
                                            type="number"
                                            value={s.quantity}
                                            onChange={(e) => sizeChangeHandler(index, 'quantity', Number(e.target.value))}
                                            className="w-24 p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700 text-center"
                                            placeholder="Qty"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeSizeHandler(index)}
                                            className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSizeHandler}
                                    className="text-xs font-bold uppercase bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:opacity-80"
                                >
                                    + Add Size Variant
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95 transition-all"
                        >
                            <FaSave /> Save Changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductEditPage;
