
import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '../hooks/useFileUpload';
import { Progress } from '@/components/ui/progress';
import { Upload, File, FileText, X, Image } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';

const FileUploadField: React.FC = () => {
  const { 
    files, 
    isUploading, 
    uploadProgress, 
    handleFileChange, 
    removeFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging
  } = useFileUpload();
  
  const getFileIcon = useCallback((file: File) => {
    const fileType = file.type.split('/')[0];
    if (fileType === 'image') {
      return <Image className="h-4 w-4 text-muted-foreground" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="h-4 w-4 text-muted-foreground" />;
    } else {
      return <File className="h-4 w-4 text-muted-foreground" />;
    }
  }, []);

  const getImagePreview = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  }, []);

  const inputId = "file-upload-field";
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div 
            className={`flex items-center justify-center border-2 ${isDragging ? 'border-primary bg-primary/5' : 'border-dashed'} rounded-lg p-8`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-2">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragging 
                  ? 'Drop files here to upload' 
                  : 'Drag and drop files here or click to upload'
                }
              </p>
              <p className="text-xs text-muted-foreground">PDF, DWG, JPG, PNG, Excel up to 10MB</p>
              <div className="mt-2">
                <label htmlFor={inputId} className="cursor-pointer">
                  <input
                    id={inputId}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.dwg"
                    disabled={isUploading}
                  />
                  <span className="inline-block">
                    <Button variant="outline" size="sm" className="mt-2" disabled={isUploading}>
                      Upload Files
                    </Button>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Selected Files</h3>
                {isUploading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Progress value={uploadProgress} className="h-2 w-20" />
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {files.map((file, index) => (
                  <li key={index} className="relative">
                    <div className="flex items-start space-x-3 p-2 border rounded-md hover:bg-gray-50">
                      <div className="p-2 bg-muted rounded-md">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      {file.type.startsWith('image/') && (
                        <div className="mt-2 flex-shrink-0">
                          <div className="relative w-12 h-12 rounded overflow-hidden">
                            <img 
                              src={getImagePreview(file)}
                              alt={file.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 absolute top-1 right-1" 
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadField;
