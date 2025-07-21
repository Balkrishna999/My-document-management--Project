import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Document from '../models/Document.js';
import User from '../models/User.js';
import Recent from '../models/Recent.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload document
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, description, accessLevel } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.user.id);
    
    // Determine resource type based on file type
    const isPDF = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    const isImage = file.mimetype.startsWith('image/') || 
                   ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(
                     file.originalname.split('.').pop().toLowerCase()
                   );
    
    let resourceType = 'auto';
    if (isPDF) {
      resourceType = 'raw';
    } else if (isImage) {
      resourceType = 'image';
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        resource_type: resourceType,
        quality: 'auto',
        fetch_format: 'auto'
      }, 
      async (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Cloudinary error', error: error.message });
      }
      const doc = new Document({
        title,
        description,
        fileType: file.originalname.split('.').pop(),
        fileUrl: result.secure_url,
        fileSize: file.size,
        uploader: user._id,
        accessLevel,
      });
      await doc.save();
      // Log upload to recents
      try {
        await Recent.create({ user: user._id, document: doc._id, action: 'upload' });
      } catch (e) { /* ignore logging errors */ }
      res.status(201).json(doc);
    });
    uploadStream.end(file.buffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get all documents (only user's own, unless admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let docs;
    if (user.role === 'admin') {
      docs = await Document.find({}).sort({ uploadDate: -1 });
    } else {
      docs = await Document.find({ uploader: user._id }).sort({ uploadDate: -1 });
    }
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download document endpoint
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const doc = await Document.findById(req.params.id);
    
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    
    // Check access permissions
    if (doc.uploader.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }

    // Set appropriate headers for download
    const fileExtension = doc.fileType?.toLowerCase() || '';
    const filename = `${doc.title}.${fileExtension}`;
    
    // Set Content-Disposition header to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Set appropriate content type
    const contentTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg', 
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    const contentType = contentTypes[fileExtension] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    
    // Redirect to the file URL with download headers
    res.redirect(doc.fileUrl);
    
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete document
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    // Only uploader or admin can delete
    if (doc.uploader.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }
    await doc.deleteOne();
    // Log delete to recents
    try {
      await Recent.create({ user: user._id, document: doc._id, action: 'delete' });
    } catch (e) { /* ignore logging errors */ }
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
