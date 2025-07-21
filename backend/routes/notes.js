import express from 'express';
import Note from '../models/Note.js';
import { authMiddleware as auth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all notes for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Latest notes first
      .lean(); // Better performance for read-only data
    
    console.log(`Fetched ${notes.length} notes for user ${req.user.username}`);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notes',
      message: error.message 
    });
  }
});

// Create a new note
router.post('/', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Validation
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Title and description are required' 
      });
    }

    if (title.length > 200) {
      return res.status(400).json({ 
        error: 'Title must be less than 200 characters' 
      });
    }

    if (description.length > 5000) {
      return res.status(400).json({ 
        error: 'Description must be less than 5000 characters' 
      });
    }

    const note = new Note({
      title: title.trim(),
      description: description.trim(),
      userId: req.user.id,
      username: req.user.username
    });
    
    const savedNote = await note.save();
    console.log('Note created:', savedNote._id, 'by user:', req.user.username);
    
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(400).json({ 
      error: 'Failed to create note',
      message: error.message 
    });
  }
});

// Update a note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Validation
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Title and description are required' 
      });
    }

    // Find note and check ownership
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!note) {
      return res.status(404).json({ 
        error: 'Note not found or you do not have permission to edit it' 
      });
    }

    // Update note
    note.title = title.trim();
    note.description = description.trim();
    note.updatedAt = new Date();
    
    const updatedNote = await note.save();
    console.log('Note updated:', updatedNote._id, 'by user:', req.user.username);
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(400).json({ 
      error: 'Failed to update note',
      message: error.message 
    });
  }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find note and check ownership
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!note) {
      return res.status(404).json({ 
        error: 'Note not found or you do not have permission to delete it' 
      });
    }

    await Note.findByIdAndDelete(req.params.id);
    console.log('Note deleted:', req.params.id, 'by user:', req.user.username);
    
    res.json({ 
      message: 'Note deleted successfully', 
      deletedId: req.params.id 
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(400).json({ 
      error: 'Failed to delete note',
      message: error.message 
    });
  }
});

// Get notes count for dashboard
router.get('/count', auth, async (req, res) => {
  try {
    const count = await Note.countDocuments({ userId: req.user.id });
    res.json({ count });
  } catch (error) {
    console.error('Error getting notes count:', error);
    res.status(500).json({ 
      error: 'Failed to get notes count',
      message: error.message 
    });
  }
});

export default router;