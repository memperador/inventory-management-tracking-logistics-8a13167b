
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, File, FileText } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { Progress } from '@/components/ui/progress';
import { formatFileSize } from '../utils/fileUtils';

const AttachmentsTab: React.FC = () => {
  const { files, isUploading, uploadProgress, handleFileChange, removeFile, uploadFiles } = useFileUpload();
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-8">
            <div className="text-center space-y-2">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drag and drop files here or click to upload</p>
              <p className="text-xs text-muted-foreground">PDF, DWG, JPG, PNG, Excel up to 10MB</p>
              <div className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <input
                    id="file-upload"
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={uploadFiles}
                  disabled={isUploading}
                >
                  Upload All
                </Button>
              </div>
              
              {isUploading && (
                <div className="my-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
              
              <ul className="divide-y">
                {files.map((file, index) => (
                  <li key={index} className="py-2 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-md">
                        {file.type.includes('pdf') ? (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <File className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px] sm:max-w-[300px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
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

export default AttachmentsTab;
