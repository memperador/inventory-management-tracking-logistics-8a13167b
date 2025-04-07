
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import RFITable from '@/components/rfi/RFITable';
import RFIFilters from '@/components/rfi/RFIFilters';
import CreateRFIDialog from '@/components/rfi/CreateRFIDialog';
import { RFI } from '@/components/rfi/types';

// Mock data for demonstration
const MOCK_RFIS: RFI[] = [
  {
    id: '1',
    title: 'Clarification on foundation reinforcement',
    description: 'Need clarification on the rebar spacing for the main building foundation.',
    projectId: '85e6bf2f-a7e0-4943-941a-07a254f1a4ed',
    createdBy: 'John Doe',
    assignedTo: 'Jane Smith',
    status: 'submitted',
    dueDate: '2025-04-20',
    createdAt: '2025-04-07T14:30:00Z',
    updatedAt: '2025-04-07T14:30:00Z',
    responseText: null,
    responseDate: null,
    category: 'Structural'
  },
  {
    id: '2',
    title: 'Electrical panel location',
    description: 'Please confirm the location of the main electrical panel as shown in drawing E-101.',
    projectId: '85e6bf2f-a7e0-4943-941a-07a254f1a4ed',
    createdBy: 'John Doe',
    assignedTo: null,
    status: 'draft',
    dueDate: '2025-04-25',
    createdAt: '2025-04-06T10:15:00Z',
    updatedAt: '2025-04-06T10:15:00Z',
    responseText: null,
    responseDate: null,
    category: 'Electrical'
  }
];

const RFIManagement = () => {
  const [rfis, setRfis] = useState<RFI[]>(MOCK_RFIS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const navigate = useNavigate();

  const handleCreateRFI = (newRFI: RFI) => {
    setRfis(prev => [newRFI, ...prev]);
    setShowCreateDialog(false);
  };

  const handleViewRFI = (rfiId: string) => {
    navigate(`/rfi/${rfiId}`);
  };

  const filteredRFIs = rfis.filter(rfi => {
    const matchesSearch = searchQuery === '' || 
      rfi.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      rfi.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = !statusFilter || rfi.status === statusFilter;
    const matchesCategory = !categoryFilter || rfi.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="RFI Management"
        description="Manage Requests for Information across your projects"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={toggleFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New RFI
            </Button>
          </div>
        }
      />

      {showFilters && (
        <Card className="p-4">
          <RFIFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
          />
        </Card>
      )}

      <RFITable 
        rfis={filteredRFIs}
        onViewRFI={handleViewRFI}
      />

      <CreateRFIDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateRFI={handleCreateRFI}
      />
    </div>
  );
};

export default RFIManagement;
