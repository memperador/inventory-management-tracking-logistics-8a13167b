
import React from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import { RequestType } from './types';

interface RequestHeaderProps {
  activeTab: RequestType;
  toggleFilters: () => void;
  openCreateDialog: () => void;
}

const RequestHeader: React.FC<RequestHeaderProps> = ({
  activeTab,
  toggleFilters,
  openCreateDialog,
}) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'rfi': return 'RFI Management';
      case 'rfq': return 'RFQ Management';
      case 'rfp': return 'RFP Management';
      default: return 'Request Management';
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case 'rfi': return 'Manage Requests for Information across your projects';
      case 'rfq': return 'Manage Requests for Quotation for materials and services';
      case 'rfp': return 'Manage Requests for Proposals for complex project needs';
      default: return 'Manage requests across your organization';
    }
  };

  return (
    <PageHeader
      title={getPageTitle()}
      description={getPageDescription()}
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={toggleFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            New {activeTab.toUpperCase()}
          </Button>
        </div>
      }
    />
  );
};

export default RequestHeader;
