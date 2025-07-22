// File type utilities for consistent handling across the application

export const SUPPORTED_FILE_TYPES = {
  // Document types
  pdf: {
    icon: 'fas fa-file-pdf',
    category: 'document',
    mimeType: 'application/pdf',
    canPreview: true
  },
  doc: {
    icon: 'fas fa-file-word',
    category: 'document',
    mimeType: 'application/msword',
    canPreview: false
  },
  docx: {
    icon: 'fas fa-file-word',
    category: 'document',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    canPreview: false
  },
  txt: {
    icon: 'fas fa-file-alt',
    category: 'document',
    mimeType: 'text/plain',
    canPreview: true
  },

  // Image types
  jpg: {
    icon: 'fas fa-file-image',
    category: 'image',
    mimeType: 'image/jpeg',
    canPreview: true
  },
  jpeg: {
    icon: 'fas fa-file-image',
    category: 'image',
    mimeType: 'image/jpeg',
    canPreview: true
  },
  png: {
    icon: 'fas fa-file-image',
    category: 'image',
    mimeType: 'image/png',
    canPreview: true
  },
  gif: {
    icon: 'fas fa-file-image',
    category: 'image',
    mimeType: 'image/gif',
    canPreview: true
  },
  bmp: {
    icon: 'fas fa-file-image',
    category: 'image',
    mimeType: 'image/bmp',
    canPreview: true
  },
  svg: {
    icon: 'fas fa-file-image',
    category: 'image',
    mimeType: 'image/svg+xml',
    canPreview: true
  },
  webp: {
    icon: 'fas fa-file-image',
    category: 'image',
    mimeType: 'image/webp',
    canPreview: true
  }
};

// Get all supported file extensions
export const getSupportedExtensions = () => {
  return Object.keys(SUPPORTED_FILE_TYPES);
};

// Get file type info
export const getFileTypeInfo = (extension) => {
  if (!extension) return null;
  const ext = extension.toLowerCase();
  return SUPPORTED_FILE_TYPES[ext] || null;
};

// Get file icon
export const getFileIcon = (extension) => {
  const info = getFileTypeInfo(extension);
  return info ? info.icon : 'fas fa-file';
};

// Check if file type is supported
export const isFileTypeSupported = (extension) => {
  return !!getFileTypeInfo(extension);
};

// Check if file can be previewed
export const canPreviewFile = (extension) => {
  const info = getFileTypeInfo(extension);
  return info ? info.canPreview : false;
};

// Get file category (image, document)
export const getFileCategory = (extension) => {
  const info = getFileTypeInfo(extension);
  return info ? info.category : 'unknown';
};

// Get MIME type
export const getMimeType = (extension) => {
  const info = getFileTypeInfo(extension);
  return info ? info.mimeType : 'application/octet-stream';
};

// Extract file extension from filename
export const extractFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

// Validate file type
export const validateFileType = (filename) => {
  const extension = extractFileExtension(filename);
  return {
    isValid: isFileTypeSupported(extension),
    extension,
    supportedTypes: getSupportedExtensions()
  };
};
