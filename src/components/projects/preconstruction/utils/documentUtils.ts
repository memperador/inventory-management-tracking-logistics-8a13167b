
/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted file size (bytes, KB, or MB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

/**
 * Gets the appropriate icon based on file type
 * @param fileType MIME type of the file
 * @returns Icon name to use for this file type
 */
export const getFileTypeIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return 'file-text';
  if (fileType.includes('image')) return 'image';
  if (fileType.includes('word') || fileType.includes('document')) return 'file-text';
  return 'file';
};

/**
 * Creates a download URL for a file
 * @param fileUrl URL of the file
 * @param fileName Name to use for the downloaded file
 * @returns Download URL with appropriate attributes
 */
export const createDownloadUrl = (fileUrl: string, fileName: string): string => {
  return fileUrl;
};
