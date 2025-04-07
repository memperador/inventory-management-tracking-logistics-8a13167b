
/**
 * Handles file validation for RFI documents
 * @param file The file to validate
 * @returns True if the file is valid, false otherwise
 */
export const validateRFIDocument = (file: File): boolean => {
  // Allowed file types
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const maxSizeInMB = 10;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // 10MB
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  // Check file size
  if (file.size > maxSizeInBytes) {
    return false;
  }
  
  return true;
};

/**
 * Formats bytes to a human-readable format
 * @param bytes The number of bytes
 * @returns Formatted string representing the size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
