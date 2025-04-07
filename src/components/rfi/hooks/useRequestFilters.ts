
import { useState } from 'react';
import { RFI, RequestType } from '../types';

export const useRequestFilters = (requests: RFI[], activeTab: RequestType) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchQuery === '' || 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      request.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesCategory = !categoryFilter || request.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    showFilters,
    setShowFilters,
    filteredRequests,
    toggleFilters
  };
};
