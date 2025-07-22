import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import FeaturedImage from '../models/featuredImage.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const secret = process.env.JWT_SECRET;

// Upload featured image (root only)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== 'root') return res.status(403).json({ message: 'Root access required' });

    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    if (!req.body.eventName || !req.body.eventUrl) return res.status(400).json({ message: 'Event name and event URL are required' });
    const result = await cloudinary.uploader.upload_stream({ folder: 'eventdekho/featured' }, async (error, result) => {
      if (error) return res.status(500).json({ message: 'Cloudinary upload failed', error });
      const featuredImage = new FeaturedImage({ url: result.secure_url, title: req.body.title, eventName: req.body.eventName, eventUrl: req.body.eventUrl });
      await featuredImage.save();
      res.status(201).json(featuredImage);
    });
    result.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// List all featured images
router.get('/', async (req, res) => {
  try {
    const images = await FeaturedImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a featured image (root only)
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== 'root') return res.status(403).json({ message: 'Root access required' });
    const { id } = req.params;
    const deleted = await FeaturedImage.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Image not found' });
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router; 