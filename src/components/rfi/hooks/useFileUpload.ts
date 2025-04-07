
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { validateRFIDocument } from '../utils/fileUtils';

type FileUploadState = {
  isUploading: boolean;
  files: File[];
  uploadProgress: number;
};

export const useFileUpload = () => {
  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    files: [],
    uploadProgress: 0,
  });
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate files
    const invalidFiles = selectedFiles.filter(file => !validateRFIDocument(file));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid files",
        description: "Some files were rejected due to invalid type or size (max 10MB).",
        variant: "destructive",
      });
      
      // Filter out invalid files
      const validFiles = selectedFiles.filter(file => validateRFIDocument(file));
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
  };

  const removeFile = (indexToRemove: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  };

  const resetFiles = () => {
    setState(prev => ({
      ...prev,
      files: [],
      uploadProgress: 0,
    }));
  };

  const uploadFiles = async () => {
    if (state.files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }
    
    setState(prev => ({ ...prev, isUploading: true }));
    
    try {
      // Simulate file upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setState(prev => ({ ...prev, uploadProgress: progress }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // In a real application, you would upload to a server or storage service
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Upload successful",
        description: `${state.files.length} file(s) uploaded successfully.`,
      });
      
      resetFiles();
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
  };

  return {
    ...state,
    handleFileChange,
    removeFile,
    uploadFiles,
    resetFiles,
  };
};
