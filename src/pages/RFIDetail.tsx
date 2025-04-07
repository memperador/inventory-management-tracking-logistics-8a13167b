
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import { 
  RFIDetailCard, 
  InformationCard, 
  ActionsCard, 
  DetailTabs
} from '@/components/rfi';
import { RFI } from '@/components/rfi/types';

// Mock data - in a real application this would come from an API or database
const MOCK_RFI: RFI = {
  id: '1',
  title: 'Clarification on foundation reinforcement',
  description: 'Need clarification on the rebar spacing for the main building foundation. The plans show 12" O.C. but the structural notes mention 8" O.C. in high-stress areas. Please confirm which spacing should be used for the southwest corner of the building.',
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
};

const RFIDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfi] = useState<RFI>(MOCK_RFI); // In a real app, fetch by ID

  const handleBackClick = () => {
    navigate('/requests');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={rfi.title}
        description={`RFI #${rfi.id}`}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleBackClick}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to RFIs
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <RFIDetailCard 
            rfi={rfi} 
            formatDate={formatDate} 
          />

          <DetailTabs />
        </div>

        <div className="space-y-6">
          <InformationCard 
            rfi={rfi} 
            formatDate={formatDate} 
          />

          <ActionsCard />
        </div>
      </div>
    </div>
  );
};

export default RFIDetail;
