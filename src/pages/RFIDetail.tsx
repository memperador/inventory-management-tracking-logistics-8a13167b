
import React from 'react';
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
import { useRFIDetail } from '@/components/rfi/hooks/useRFIDetail';
import { formatDate } from '@/components/rfi/utils/dateUtils';
import LoadingIndicator from '@/components/common/LoadingIndicator';

const RFIDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rfi, isLoading, error } = useRFIDetail(id);

  const handleBackClick = () => {
    navigate('/requests');
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error || !rfi) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading RFI</h2>
        <p className="mb-4">{error || 'RFI not found'}</p>
        <Button onClick={handleBackClick}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to RFIs
        </Button>
      </div>
    );
  }

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
