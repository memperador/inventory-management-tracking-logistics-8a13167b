
import React from 'react';
import { File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FilePreviewProps {
  file: File;
  fileSize: string;
  removeFile: () => void;
  isUploading: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  fileSize,
  removeFile,
  isUploading,
}) => {
  return (
    <div className="space-y-2">
      <Label>Selected File</Label>
      <div className="bg-muted/50 p-2 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              <File className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{fileSize}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
