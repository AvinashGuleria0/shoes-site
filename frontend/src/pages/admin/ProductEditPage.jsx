import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const ProductEditPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState([{ size: '', quantity: 0 }]);
  
  // Image Angles
  const [imageFront, setImageFront] = useState('');
  const [imageSide, setImageSide] = useState('');
  const [imageBack, setImageBack] = useState('');
  const [uploading, setUploading] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${productId}`);
        setName(data.name);
        setPrice(data.price);
        setDescription(data.description);
        setCategory(data.category);
        setSizes(data.sizes && data.sizes.length > 0 ? data.sizes : [{ size: '', quantity: 0 }]);
        // Safely set images
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

  const uploadFileHandler = async (e, setImageFunction) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      // In production, this returns a Cloudinary URL.
      // In dev, it returns a local path like /uploads/image-123.jpg
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, config);
      
      // If local dev, we need to prepend the server URL to view it, or just store the path
      // IMPORTANT: If your backend serves static files, the path is enough.
      // But for this demo, let's assume we store the returned path.
      setImageFunction(data);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Image upload failed');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validation: Ensure all sizes have a name and quantity
    const validSizes = sizes.filter(s => s.size.trim() !== '');
    if (validSizes.length === 0) {
      toast.error('Please add at least one valid size');
      return;
    }

    if (!imageFront || !imageSide || !imageBack) {
      toast.error('Please upload all three image angles (Front, Side, Back)');
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/products/${productId}`,
        {
          name,
          price,
          description,
          category,
          sizes: validSizes,
          images: {
            front: imageFront,
            side: imageSide,
            back: imageBack
          }
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      toast.success('Product Updated');
      navigate('/admin/dashboard/products');
    } catch (error) {
       toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className='max-w-2xl mx-auto pb-20'>
      <Link to="/admin/products" className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white mb-4 block">
        &larr; Go Back
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      
      <form onSubmit={submitHandler} className="space-y-6">
        
        {/* NAME */}
        <div>
            <label className="block mb-2 font-bold">Name</label>
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
            />
        </div>

        {/* PRICE */}
        <div>
            <label className="block mb-2 font-bold">Price</label>
            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
            />
        </div>

        {/* SIZES & STOCK */}
        <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded border dark:border-zinc-700">
            <h3 className="font-bold mb-4">Inventory (Sizes & Stock)</h3>
            {sizes.map((s, index) => (
                <div key={index} className="flex gap-4 mb-3 items-end">
                    <div className="flex-1">
                        <label className="block text-xs mb-1">Size (e.g. UK 9)</label>
                        <input
                            type="text"
                            value={s.size}
                            onChange={(e) => sizeChangeHandler(index, 'size', e.target.value)}
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                            placeholder="Size"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs mb-1">Quantity</label>
                        <input
                            type="number"
                            value={s.quantity}
                            onChange={(e) => sizeChangeHandler(index, 'quantity', Number(e.target.value))}
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                            placeholder="Qty"
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={() => removeSizeHandler(index)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 mb-0.5"
                    >
                        &times;
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={addSizeHandler}
                className="text-blue-500 text-sm font-bold hover:underline mt-2"
            >
                + Add Size
            </button>
        </div>

        {/* IMAGE UPLOADS - THE CORE OF SCROLLYTELLING */}
        <div className="bg-blue-50 dark:bg-zinc-900 p-4 rounded border dark:border-zinc-700">
            <h3 className="font-bold mb-4 text-blue-600 dark:text-blue-400">GSAP Animation Assets (3 Angles)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* FRONT */}
                <div>
                   <label className="block text-sm mb-1">Front Angle</label>
                   <input
                      type="text"
                      placeholder="Enter image url"
                      value={imageFront}
                      onChange={(e) => setImageFront(e.target.value)}
                      className="w-full p-2 border rounded text-xs mb-2 dark:bg-zinc-800"
                   />
                   <input type="file" onChange={(e) => uploadFileHandler(e, setImageFront)} className="text-xs" />
                </div>

                {/* SIDE */}
                <div>
                   <label className="block text-sm mb-1">Side Angle (Main)</label>
                   <input
                      type="text"
                      placeholder="Enter image url"
                      value={imageSide}
                      onChange={(e) => setImageSide(e.target.value)}
                      className="w-full p-2 border rounded text-xs mb-2 dark:bg-zinc-800"
                   />
                   <input type="file" onChange={(e) => uploadFileHandler(e, setImageSide)} className="text-xs" />
                </div>

                {/* BACK */}
                <div>
                   <label className="block text-sm mb-1">Back Angle</label>
                   <input
                      type="text"
                      placeholder="Enter image url"
                      value={imageBack}
                      onChange={(e) => setImageBack(e.target.value)}
                      className="w-full p-2 border rounded text-xs mb-2 dark:bg-zinc-800"
                   />
                   <input type="file" onChange={(e) => uploadFileHandler(e, setImageBack)} className="text-xs" />
                </div>
            </div>
            
            {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}
        </div>

        {/* DESCRIPTION */}
        <div>
            <label className="block mb-2 font-bold">Description</label>
            <textarea
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded h-32 dark:bg-zinc-800 dark:border-zinc-700"
            ></textarea>
        </div>

        <button
            type="submit"
            className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 font-bold uppercase tracking-widest hover:opacity-90 rounded"
        >
            Update
        </button>

      </form>
    </div>
  );
};

export default ProductEditPage;
