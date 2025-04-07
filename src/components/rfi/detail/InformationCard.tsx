
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Tag, User } from 'lucide-react';
import { RFI } from '../types';

interface InformationCardProps {
  rfi: RFI;
  formatDate: (date: string | null) => string;
}

const InformationCard: React.FC<InformationCardProps> = ({ rfi, formatDate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div className="flex items-start">
            <dt className="w-8 mr-2 pt-0.5">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </dt>
            <div>
              <dd className="text-sm font-medium">Due Date</dd>
              <dt className="text-sm text-muted-foreground">{formatDate(rfi.dueDate)}</dt>
            </div>
          </div>
          
          <div className="flex items-start">
            <dt className="w-8 mr-2 pt-0.5">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </dt>
            <div>
              <dd className="text-sm font-medium">Created On</dd>
              <dt className="text-sm text-muted-foreground">{formatDate(rfi.createdAt)}</dt>
            </div>
          </div>

          <div className="flex items-start">
            <dt className="w-8 mr-2 pt-0.5">
              <Tag className="h-5 w-5 text-muted-foreground" />
            </dt>
            <div>
              <dd className="text-sm font-medium">Category</dd>
              <dt className="text-sm text-muted-foreground">{rfi.category}</dt>
            </div>
          </div>
          
          <div className="flex items-start">
            <dt className="w-8 mr-2 pt-0.5">
              <User className="h-5 w-5 text-muted-foreground" />
            </dt>
            <div>
              <dd className="text-sm font-medium">Created By</dd>
              <dt className="text-sm text-muted-foreground">{rfi.createdBy}</dt>
            </div>
          </div>
          
          {rfi.assignedTo && (
            <div className="flex items-start">
              <dt className="w-8 mr-2 pt-0.5">
                <User className="h-5 w-5 text-muted-foreground" />
              </dt>
              <div>
                <dd className="text-sm font-medium">Assigned To</dd>
                <dt className="text-sm text-muted-foreground">{rfi.assignedTo}</dt>
              </div>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};

export default InformationCard;
