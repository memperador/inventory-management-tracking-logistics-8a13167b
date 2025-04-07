
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import RFIStatusBadge from './RFIStatusBadge';
import RFIDescription from './RFIDescription';
import RFIResponse from './RFIResponse';
import { RFI } from '../types';

interface RFIDetailCardProps {
  rfi: RFI;
  formatDate: (date: string | null) => string;
}

const RFIDetailCard: React.FC<RFIDetailCardProps> = ({ rfi, formatDate }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle>Request Details</CardTitle>
          <RFIStatusBadge status={rfi.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RFIDescription description={rfi.description} />
          <RFIResponse 
            responseText={rfi.responseText} 
            responseDate={rfi.responseDate}
            formatDate={formatDate}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RFIDetailCard;
