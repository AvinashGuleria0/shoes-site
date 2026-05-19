const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kicks_store',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = multer({ storage });

// @desc    Standard Upload to Cloudinary CDN
// @route   POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.send(req.file.path);
});

// Memory storage for piping to APIs
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

// @desc    Remove Background API -> Stream to Cloudinary CDN
// @route   POST /api/upload/removebg
router.post('/removebg', uploadMemory.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', req.file.buffer, { filename: req.file.originalname });

    const removeBgResponse = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
      responseType: 'arraybuffer',
      encoding: null
    });

    if (removeBgResponse.status === 200) {
      const cloudinaryUpload = () => {
         return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
               { folder: 'kicks_store', format: 'png' },
               (error, result) => {
                  if (error) return reject(error);
                  resolve(result);
               }
            );
            uploadStream.end(removeBgResponse.data);
         });
      };

      const result = await cloudinaryUpload();
      res.send(result.secure_url);
    } else {
      res.status(500).send('Remove.bg API Error');
    }

  } catch (error) {
     const errorData = error.response ? error.response.data.toString() : error.message;
     console.error('Remove.BG Request Failed:', errorData);
     res.status(400).json({ message: 'Background removal failed. Check server logs for details.' });
  }
});

module.exports = router;
