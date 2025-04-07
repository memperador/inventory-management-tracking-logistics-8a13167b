
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const AttachmentsTab: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-8">
          <div className="text-center space-y-2">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drag and drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground">PDF, DWG, JPG, PNG up to 10MB</p>
            <Button variant="outline" size="sm" className="mt-2">
              Upload Files
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttachmentsTab;
