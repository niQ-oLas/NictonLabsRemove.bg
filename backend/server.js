const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post('/remove-background', upload.single('image'), (req, res) => {
  // Here you would implement the background removal logic
  // For demonstration, we'll just return the uploaded image URL
  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});