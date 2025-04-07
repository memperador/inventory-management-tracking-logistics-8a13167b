
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, FileText, ClipboardList, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import { RFITable, RFIFilters, CreateRFIDialog } from '@/components/rfi';
import { RFI, RequestType } from '@/components/rfi/types';

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
    category: 'Structural',
    type: 'rfi'
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
    category: 'Electrical',
    type: 'rfi'
  }
];

const MOCK_RFQS: RFI[] = [
  {
    id: '101',
    title: 'Concrete supply for foundation',
    description: 'Need quotes for 50 cubic yards of 4000 PSI concrete.',
    projectId: '85e6bf2f-a7e0-4943-941a-07a254f1a4ed',
    createdBy: 'John Doe',
    assignedTo: null,
    status: 'sent',
    dueDate: '2025-04-15',
    createdAt: '2025-04-05T09:30:00Z',
    updatedAt: '2025-04-05T09:30:00Z',
    responseText: null,
    responseDate: null,
    category: 'Materials',
    type: 'rfq'
  }
];

const MOCK_RFPS: RFI[] = [
  {
    id: '201',
    title: 'Mechanical System Design-Build',
    description: 'Seeking proposals for complete HVAC system design and installation.',
    projectId: '85e6bf2f-a7e0-4943-941a-07a254f1a4ed',
    createdBy: 'Jane Smith',
    assignedTo: null,
    status: 'published',
    dueDate: '2025-05-01',
    createdAt: '2025-04-01T13:45:00Z',
    updatedAt: '2025-04-01T13:45:00Z',
    responseText: null,
    responseDate: null,
    category: 'Engineering Services',
    type: 'rfp'
  }
];

const RequestManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RequestType>('rfi');
  const [requests, setRequests] = useState<{
    rfi: RFI[],
    rfq: RFI[],
    rfp: RFI[]
  }>({
    rfi: MOCK_RFIS,
    rfq: MOCK_RFQS,
    rfp: MOCK_RFPS
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const navigate = useNavigate();

  const handleCreateRequest = (newRequest: RFI) => {
    setRequests(prev => ({
      ...prev,
      [activeTab]: [newRequest, ...prev[activeTab]]
    }));
    setShowCreateDialog(false);
  };

  const handleViewRequest = (requestId: string) => {
    navigate(`/${activeTab}/${requestId}`);
  };

  const filteredRequests = requests[activeTab].filter(request => {
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
    <div className="space-y-6">
      <PageHeader
        title={getPageTitle()}
        description={getPageDescription()}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={toggleFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New {activeTab.toUpperCase()}
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RequestType)} className="w-full">
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

        {showFilters && (
          <Card className="p-4 mb-6">
            <RFIFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              requestType={activeTab}
            />
          </Card>
        )}

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
