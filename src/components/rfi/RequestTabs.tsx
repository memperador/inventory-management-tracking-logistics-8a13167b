
import React from 'react';
import { FileText, ClipboardList, FileSearch } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RFITable } from '@/components/rfi';
import { RequestType } from './types';

interface RequestTabsProps {
  activeTab: RequestType;
  onTabChange: (value: RequestType) => void;
  filteredRequests: any[];
  handleViewRequest: (id: string) => void;
}

const RequestTabs: React.FC<RequestTabsProps> = ({
  activeTab,
  onTabChange,
  filteredRequests,
  handleViewRequest,
}) => {
  const getIcon = (type: RequestType) => {
    switch (type) {
      case 'rfi': return <FileText className="h-4 w-4 mr-2" />;
      case 'rfq': return <ClipboardList className="h-4 w-4 mr-2" />;
      case 'rfp': return <FileSearch className="h-4 w-4 mr-2" />;
    }
  };

  const getTabTitle = (type: RequestType) => {
    return type.toUpperCase();
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as RequestType)} className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="rfi">
          {getIcon('rfi')}
          {getTabTitle('rfi')}
        </TabsTrigger>
        <TabsTrigger value="rfq">
          {getIcon('rfq')}
          {getTabTitle('rfq')}
        </TabsTrigger>
        <TabsTrigger value="rfp">
          {getIcon('rfp')}
          {getTabTitle('rfp')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rfi" className="mt-0">
        <RFITable 
          rfis={filteredRequests}
          onViewRFI={handleViewRequest}
          requestType="rfi"
        />
      </TabsContent>
      <TabsContent value="rfq" className="mt-0">
        <RFITable 
          rfis={filteredRequests}
          onViewRFI={handleViewRequest}
          requestType="rfq"
        />
      </TabsContent>
      <TabsContent value="rfp" className="mt-0">
        <RFITable 
          rfis={filteredRequests}
          onViewRFI={handleViewRequest}
          requestType="rfp"
        />
      </TabsContent>
    </Tabs>
  );
};

export default RequestTabs;
