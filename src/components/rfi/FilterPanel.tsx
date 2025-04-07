
import React from 'react';
import { Card } from '@/components/ui/card';
import { RFIFilters } from '@/components/rfi';
import { RequestType } from './types';

interface FilterPanelProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string | null;
  setStatusFilter: (value: string | null) => void;
  categoryFilter: string | null;
  setCategoryFilter: (value: string | null) => void;
  requestType: RequestType;
  showFilters: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  requestType,
  showFilters,
}) => {
  if (!showFilters) return null;

  return (
    <Card className="p-4 mb-6">
      <RFIFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        requestType={requestType}
      />
    </Card>
  );
};

export default FilterPanel;
