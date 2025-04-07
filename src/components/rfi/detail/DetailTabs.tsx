
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageCircle } from 'lucide-react';
import AttachmentsTab from './AttachmentsTab';
import CommentsTab from './CommentsTab';

const DetailTabs: React.FC = () => {
  return (
    <Tabs defaultValue="attachments">
      <TabsList>
        <TabsTrigger value="attachments">
          <FileText className="h-4 w-4 mr-2" />
          Attachments
        </TabsTrigger>
        <TabsTrigger value="comments">
          <MessageCircle className="h-4 w-4 mr-2" />
          Comments
        </TabsTrigger>
      </TabsList>
      <TabsContent value="attachments" className="space-y-4">
        <AttachmentsTab />
      </TabsContent>
      <TabsContent value="comments" className="space-y-4">
        <CommentsTab />
      </TabsContent>
    </Tabs>
  );
};

export default DetailTabs;
