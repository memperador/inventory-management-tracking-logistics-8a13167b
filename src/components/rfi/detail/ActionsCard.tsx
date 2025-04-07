
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, MessageCircle } from 'lucide-react';

const ActionsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <Button variant="outline" className="justify-start">
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </Button>
          <Button variant="outline" className="justify-start">
            <MessageCircle className="mr-2 h-4 w-4" />
            Add Comment
          </Button>
          <Button variant="outline" className="justify-start text-red-500 hover:text-red-500">
            Close RFI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionsCard;
