import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type FileUploadState = {
  isUploading: boolean;
  files: File[];
  uploadProgress: number;
  isDragging: boolean;
};

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  onSuccess?: (files: File[]) => void;
}

export const useFileUploadWithPreview = (options: UseFileUploadOptions = {}) => {
  const {
    maxFiles = 5,
    maxSizeInMB = 10,
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    onSuccess
  } = options;
  
  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    files: [],
    uploadProgress: 0,
    isDragging: false
  });
  const { toast } = useToast();

  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return false;
    }
    
    // Check file size (convert MB to bytes)
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return false;
    }
    
    return true;
  }, [allowedTypes, maxSizeInMB]);

  const processFiles = useCallback((selectedFiles: File[]) => {
    // Check if adding these files would exceed the max count
    if (state.files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum of ${maxFiles} files allowed`,
        variant: "destructive",
      });
      
      // If we already have max files, return early
      if (state.files.length >= maxFiles) {
        return;
      }
      
      // Otherwise take only what we can fit
      selectedFiles = selectedFiles.slice(0, maxFiles - state.files.length);
    }
    
    // Validate files
    const invalidFiles = selectedFiles.filter(file => !validateFile(file));
    
    if (invalidFiles.length > 0) {
      const typeMessage = allowedTypes.length > 0 ? 
        `Accepted formats: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}` :
        'Invalid file type';
        
      toast({
        title: "Some files were rejected",
        description: `${typeMessage}. Maximum size: ${maxSizeInMB}MB.`,
        variant: "destructive",
      });
      
      // Filter out invalid files
      const validFiles = selectedFiles.filter(file => validateFile(file));
      
      if (validFiles.length === 0) return;
      
      setState(prev => ({
        ...prev,
        files: [...prev.files, ...validFiles],
      }));
      
      return;
    }
    
    setState(prev => ({
      ...prev,
      files: [...prev.files, ...selectedFiles],
    }));
    
  }, [state.files, maxFiles, validateFile, toast]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setState(prev => ({ ...prev, isDragging: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  const removeFile = useCallback((indexToRemove: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  }, []);

  const resetFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      files: [],
      uploadProgress: 0,
    }));
  }, []);

  const uploadFiles = useCallback(async () => {
    if (state.files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return false;
    }
    
    setState(prev => ({ ...prev, isUploading: true }));
    
    try {
      // Simulate file upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setState(prev => ({ ...prev, uploadProgress: progress }));
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // In a real application, you would upload to a server or storage service
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast({
        title: "Upload successful",
        description: `${state.files.length} file(s) uploaded successfully.`,
      });
      
      if (onSuccess) {
        onSuccess(state.files);
      }
      
      return true;
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
    }
  }, [state.files, toast, onSuccess]);

  return {
    ...state,
    handleFileChange,
    removeFile,
    uploadFiles,
    resetFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setFiles: (files: File[]) => setState(prev => ({ ...prev, files }))
  };
};
