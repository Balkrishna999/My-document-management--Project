import { useState } from 'react';
import { canPreviewFile, getFileCategory, extractFileExtension } from '../utils/fileTypes';

export default function DocumentModal({ doc, currentUser, onClose }) {
  const [deleting, setDeleting] = useState(false);

  async function downloadDocument() {
    if (!doc.fileUrl) return alert('No file available for download.');

    const ext = doc.fileType?.toLowerCase() || '';
    const fileName = `${doc.title || 'document'}.${ext}`;

    if (ext === 'pdf') {
      // For PDFs, try multiple approaches to ensure download works
      try {
        // First try: Use original URL directly
        const response = await fetch(doc.fileUrl, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          return;
        }
      } catch (err) {
        console.log('Original URL failed, trying raw URL...');
      }

      // Second try: Use raw URL
      try {
        const rawUrl = doc.fileUrl.replace('/image/upload/', '/raw/upload/');
        const response = await fetch(rawUrl, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${doc.title || 'document'}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          return;
        }
      } catch (err) {
        console.log('Raw URL failed, using direct link...');
      }

      // Final fallback: Open in new tab
      window.open(doc.fileUrl, '_blank', 'noopener');
    } else {
      // For non-PDFs including images
      let url = doc.fileUrl;

      // For images, force download using fetch and blob
      if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) {
        try {
          // Force download for images instead of opening them
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
            return;
          }
        } catch (err) {
          console.log('Image fetch failed, trying direct download...');
        }

        // Fallback: Use download attribute with proper MIME type
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // For other file types (doc, txt, etc.)
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }
  }

  async function deleteDocument() {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`http://localhost:5000/api/documents/${doc._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      alert('Document deleted successfully!');
      onClose(true); // Pass true to trigger reload in DocumentsView
    } catch (err) {
      alert('Delete failed: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  }

  function renderFilePreview() {
    if (!doc.fileUrl) return <div style={{ color: '#888' }}>No preview available.</div>;

    const type = doc.fileType?.toLowerCase() || '';

    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(type)) {
      return <img src={doc.fileUrl} alt={doc.title} style={{ maxWidth: '100%', maxHeight: 300, margin: '10px auto' }} />;
    }

    // PDF files
    if (type === 'pdf') {
      // Try both image and raw URLs for compatibility
      const displayUrl = doc.fileUrl.includes('/raw/upload/') ? doc.fileUrl : doc.fileUrl;
      return (
        <div>
          <iframe src={displayUrl} title={doc.title} style={{ width: '100%', height: 400, border: 'none', margin: '10px 0' }}
            onError={(e) => {
              // If iframe fails, try raw URL
              const rawUrl = doc.fileUrl.replace('/image/upload/', '/raw/upload/');
              e.target.src = rawUrl;
            }} />
          <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            If preview doesn't load, try the Download or Open button below.
          </p>
        </div>
      );
    }
    if (['txt'].includes(type)) {
      return <iframe src={doc.fileUrl} title={doc.title} style={{ width: '100%', height: 200, border: '1px solid #eee', margin: '10px 0' }} />;
    }
    return <div style={{ color: '#888' }}>Preview not supported for this file type.</div>;
  }

  return (
    <div className="modal active" id="documentModal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{doc.title}</h3>
          <span className="close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          <div className="document-info">
            <p><strong>Description:</strong> {doc.description}</p>
            <p><strong>Category:</strong> {doc.category}</p>
            <p><strong>Access Level:</strong> {doc.accessLevel}</p>
            <p><strong>Uploaded:</strong> {new Date(doc.uploadDate).toLocaleDateString()}</p>
            <p><strong>Version:</strong> {doc.version}</p>
          </div>
          <div className="document-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={downloadDocument}>Download</button>
            <button className="btn btn-secondary" onClick={async () => {
              if (!doc.fileUrl) return alert('No file available to open.');
              const type = doc.fileType?.toLowerCase() || '';

              if (type === 'pdf') {
                // Use Google Drive Viewer for PDFs
                let pdfUrl = doc.fileUrl;
                // Prefer raw URL for Cloudinary PDFs
                if (!pdfUrl.includes('/raw/upload/')) {
                  pdfUrl = pdfUrl.replace('/image/upload/', '/raw/upload/');
                }
                // Google Drive Viewer URL
                const viewerUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
                window.open(viewerUrl, '_blank', 'noopener');
              } else if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "txt"].includes(type)) {
                window.open(doc.fileUrl, '_blank', 'noopener');
              } else {
                alert('Preview not supported for this file type. Please download instead.');
              }
            }}>Open</button>
            <button className="btn btn-danger" onClick={deleteDocument} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            {/* Show/Hide File button removed as requested */}
          </div>
          {/* File preview toggling removed as requested */}
          {/* Version history removed: not supported by backend */}
        </div>
      </div>
    </div>
  );
}
