const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

// Set up storage engine (Disk Storage for now, or Cloudinary in prod)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only! (Supported: jpg, jpeg, png, webp)');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Helper to handle multer errors
const uploadSingleImage = (req, res, next) => {
  const uploadMiddleware = upload.single('image');
  
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer Error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err });
    }
    next();
  });
};

// Since we don't have Real Cloudinary keys yet, we'll implement a Local Upload
// Logic: Admin uploads -> Saved to backend/uploads -> URL returned is /uploads/filename
router.post('/', uploadSingleImage, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.send(`/uploads/${req.file.filename}`);
});

// Handle background removal using remove.bg API
router.post('/removebg', uploadSingleImage, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const inputPath = req.file.path;
  const outputFilename = `nobg-${Date.now()}.png`; // Remove.bg returns PNG
  const outputPath = path.join(__dirname, '../uploads/', outputFilename);

  try {
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', fs.createReadStream(inputPath));

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
      responseType: 'arraybuffer',
      encoding: null
    });

    if (response.status === 200) {
      fs.writeFileSync(outputPath, response.data);
      // Clean up the original file with background
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      res.send(`/uploads/${outputFilename}`);
    } else {
      console.error('Remove.bg Error:', response.status, response.statusText);
      res.status(500).send('Remove.bg API Error');
    }

  } catch (error) {
     const errorData = error.response ? error.response.data.toString() : error.message;
     console.error('Remove.BG Request Failed:', errorData);
     
     if (errorData.includes('auth_failed')) {
        res.status(401).json({ message: 'Remove.bg Authorization Failed. Please add a valid REMOVE_BG_API_KEY to your .env file.' });
     } else {
        res.status(400).json({ message: 'Background removal failed. Check server logs for details.' });
     }
  }
});

module.exports = router;
