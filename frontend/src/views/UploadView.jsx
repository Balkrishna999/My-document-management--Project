import { useState } from 'react';
import { uploadDocument } from '../api';

export default function UploadView({ currentUser }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!title || !file) {
      alert('Please fill in all required fields and select a file.');
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size too large. Maximum size allowed is 10MB.');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      alert('Invalid file type. Please select a supported file format.');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      await uploadDocument({
        token,
        file,
        title,
        description,
        category: 'general',
        accessLevel: 'public',
      });
      setTitle(''); 
      setDescription(''); 
      setFile(null);
      // Clear file input
      document.getElementById('fileInput').value = '';
      alert('Document uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="uploadView" className="view active">
      <div className="view-header">
        <h2>Upload Document</h2>
      </div>
      <div className="upload-container">
        <div className="upload-form">
          <div className="form-group">
            <label htmlFor="documentTitle">Document Title</label>
            <input id="documentTitle" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="documentDescription">Description</label>
            <textarea id="documentDescription" rows="3" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="fileInput">Select File</label>
            <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp" onChange={e => setFile(e.target.files[0])} required />
          </div>
          <button type="button" className="btn btn-primary" onClick={handleUpload} disabled={loading}>{loading ? 'Uploading...' : 'Upload Document'}</button>
        </div>
      </div>
    </div>
  );
}
