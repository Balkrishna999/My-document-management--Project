import express from 'express';
import Document from '../models/Document.js';
import Recent from '../models/Recent.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user-specific analytics (for Data Usage view)
router.get('/user-stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // User's document statistics
    const userDocs = await Document.find({ uploader: userId });
    const totalSize = userDocs.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

    // User's recent activity
    const recentActivity = await Recent.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('document', 'title fileType');

    // User's file type distribution
    const fileTypes = await Document.aggregate([
      {
        $match: {
          uploader: userId,
          fileType: { $exists: true, $ne: null, $ne: "" } // Only include documents with valid fileType
        }
      },
      {
        $group: {
          _id: '$fileType',
          count: { $sum: 1 },
          totalSize: { $sum: { $ifNull: ['$fileSize', 0] } } // Handle null fileSize
        }
      },
      {
        $sort: { count: -1 } // Sort by count descending
      }
    ]);

    // User's upload timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const uploadTimeline = await Document.aggregate([
      {
        $match: {
          uploader: userId,
          uploadDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$uploadDate' },
            month: { $month: '$uploadDate' },
            day: { $dayOfMonth: '$uploadDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      totalDocuments: userDocs.length,
      totalStorage: totalSize,
      recentActivity,
      fileTypes,
      uploadTimeline,
      // Debug info
      debug: {
        foundDocuments: userDocs.length,
        documentsWithFileType: fileTypes.reduce((sum, ft) => sum + ft.count, 0),
        uniqueFileTypes: fileTypes.length
      }
    });

  } catch (err) {
    console.error('User stats error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;