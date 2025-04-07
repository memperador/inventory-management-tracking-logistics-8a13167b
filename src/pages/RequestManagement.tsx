
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RFI, RequestType } from '@/components/rfi/types';
import { CreateRFIDialog } from '@/components/rfi';
import RequestHeader from '@/components/rfi/RequestHeader';
import RequestTabs from '@/components/rfi/RequestTabs';
import FilterPanel from '@/components/rfi/FilterPanel';
import { useRequestData } from '@/components/rfi/hooks/useRequestData';
import { useRequestFilters } from '@/components/rfi/hooks/useRequestFilters';

const RequestManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RequestType>('rfi');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const navigate = useNavigate();
  
  // Custom hooks for data management
  const { requests, handleCreateRequest } = useRequestData();
  const { 
    searchQuery, 
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    showFilters,
    toggleFilters,
    filteredRequests
  } = useRequestFilters(requests[activeTab], activeTab);

  const handleViewRequest = (requestId: string) => {
    navigate(`/${activeTab}/${requestId}`);
  };

  const handleTabChange = (tab: RequestType) => {
    setActiveTab(tab);
  };

  const openCreateDialog = () => {
    setShowCreateDialog(true);
  };

  return (
    <div className="space-y-6">
      <RequestHeader 
        activeTab={activeTab}
        toggleFilters={toggleFilters}
        openCreateDialog={openCreateDialog}
      />

      <FilterPanel 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        requestType={activeTab}
        showFilters={showFilters}
      />

      <RequestTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        filteredRequests={filteredRequests}
        handleViewRequest={handleViewRequest}
      />

      <CreateRFIDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateRequest={handleCreateRequest}
        requestType={activeTab}
      />
    </div>
  );
};

export default RequestManagement;
