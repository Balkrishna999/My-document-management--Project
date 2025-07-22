// Backend file type utilities

export const SUPPORTED_FILE_TYPES = {
  // Document types
  pdf: {
    mimeType: 'application/pdf',
    category: 'document',
    cloudinaryResourceType: 'raw'
  },
  doc: {
    mimeType: 'application/msword',
    category: 'document',
    cloudinaryResourceType: 'raw'
  },
  docx: {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'document',
    cloudinaryResourceType: 'raw'
  },
  txt: {
    mimeType: 'text/plain',
    category: 'document',
    cloudinaryResourceType: 'raw'
  },

  // Image types
  jpg: {
    mimeType: 'image/jpeg',
    category: 'image',
    cloudinaryResourceType: 'image'
  },
  jpeg: {
    mimeType: 'image/jpeg',
    category: 'image',
    cloudinaryResourceType: 'image'
  },
  png: {
    mimeType: 'image/png',
    category: 'image',
    cloudinaryResourceType: 'image'
  },
  gif: {
    mimeType: 'image/gif',
    category: 'image',
    cloudinaryResourceType: 'image'
  },
  bmp: {
    mimeType: 'image/bmp',
    category: 'image',
    cloudinaryResourceType: 'image'
  },
  svg: {
    mimeType: 'image/svg+xml',
    category: 'image',
    cloudinaryResourceType: 'image'
  },
  webp: {
    mimeType: 'image/webp',
    category: 'image',
    cloudinaryResourceType: 'image'
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

// Check if file type is supported
export const isFileTypeSupported = (extension) => {
  return !!getFileTypeInfo(extension);
};

// Get MIME type
export const getMimeType = (extension) => {
  const info = getFileTypeInfo(extension);
  return info ? info.mimeType : 'application/octet-stream';
};

// Get Cloudinary resource type
export const getCloudinaryResourceType = (extension) => {
  const info = getFileTypeInfo(extension);
  return info ? info.cloudinaryResourceType : 'auto';
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

// Get all content types for download headers
export const getContentTypes = () => {
  const contentTypes = {};
  Object.entries(SUPPORTED_FILE_TYPES).forEach(([ext, info]) => {
    contentTypes[ext] = info.mimeType;
  });
  return contentTypes;
};
