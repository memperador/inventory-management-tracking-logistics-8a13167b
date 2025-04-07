
import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { RFI_CATEGORIES, RFQ_CATEGORIES, RFP_CATEGORIES, RequestType } from './types';

interface RFIFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string | null;
  setStatusFilter: (value: string | null) => void;
  categoryFilter: string | null;
  setCategoryFilter: (value: string | null) => void;
  requestType: RequestType;
}

const RFIFilters: React.FC<RFIFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  requestType
}) => {
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setCategoryFilter(null);
  };

  const getStatusOptions = () => {
    switch (requestType) {
      case 'rfi':
        return [
          { value: 'draft', label: 'Draft' },
          { value: 'submitted', label: 'Submitted' },
          { value: 'answered', label: 'Answered' },
          { value: 'closed', label: 'Closed' },
        ];
      case 'rfq':
        return [
          { value: 'draft', label: 'Draft' },
          { value: 'sent', label: 'Sent' },
          { value: 'received', label: 'Received' },
          { value: 'evaluated', label: 'Evaluated' },
          { value: 'awarded', label: 'Awarded' },
          { value: 'closed', label: 'Closed' },
        ];
      case 'rfp':
        return [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
          { value: 'reviewing', label: 'Reviewing' },
          { value: 'shortlisted', label: 'Shortlisted' },
          { value: 'awarded', label: 'Awarded' },
          { value: 'closed', label: 'Closed' },
        ];
      default:
        return [];
    }
  };

  const getCategoryOptions = () => {
    switch (requestType) {
      case 'rfi':
        return RFI_CATEGORIES;
      case 'rfq':
        return RFQ_CATEGORIES;
      case 'rfp':
        return RFP_CATEGORIES;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${requestType.toUpperCase()}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {getStatusOptions().map(status => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={categoryFilter || "all"}
          onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {getCategoryOptions().map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RFIFilters;
