const path = require('path');
const express = require('express');
const multer = require('multer');
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
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Since we don't have Real Cloudinary keys yet, we'll implement a Local Upload
// Logic: Admin uploads -> Saved to backend/uploads -> URL returned is /uploads/filename
router.post('/', upload.single('image'), (req, res) => {
  res.send(`/uploads/${req.file.filename}`);
});

module.exports = router;
