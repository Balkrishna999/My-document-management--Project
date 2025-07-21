import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import recentsRoutes from './routes/recents.js';
import notesRoutes from './routes/notes.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log('Cloudinary connected');

const app = express();
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/recents', recentsRoutes);
app.use('/api/notes', notesRoutes);

const PORT = process.env.PORT || 5000;

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Full error:', err);
    
    // Start server anyway for testing (without MongoDB)
    app.listen(PORT, () => {
      console.log(`⚠️  Server running on port ${PORT} (MongoDB connection failed)`);
    });
  });
