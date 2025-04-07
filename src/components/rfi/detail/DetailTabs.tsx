
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageCircle, Bot } from 'lucide-react';
import AttachmentsTab from './AttachmentsTab';
import CommentsTab from './CommentsTab';
import RFIAssistant from './RFIAssistant';

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
        <TabsTrigger value="assistant">
          <Bot className="h-4 w-4 mr-2" />
          AI Assistant
        </TabsTrigger>
      </TabsList>
      <TabsContent value="attachments" className="space-y-4">
        <AttachmentsTab />
      </TabsContent>
      <TabsContent value="comments" className="space-y-4">
        <CommentsTab />
      </TabsContent>
      <TabsContent value="assistant" className="space-y-4">
        <RFIAssistant />
      </TabsContent>
    </Tabs>
  );
};

export default DetailTabs;
