
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { RFI, RequestType } from './types';

interface RFITableProps {
  rfis: RFI[];
  onViewRFI: (id: string) => void;
  requestType: RequestType;
}

const getStatusColor = (status: string, type: RequestType): string => {
  const commonMap: Record<string, string> = {
    'draft': 'bg-slate-500',
    'closed': 'bg-gray-500',
  };
  
  if (commonMap[status]) {
    return commonMap[status];
  }

  switch (type) {
    case 'rfi':
      switch (status) {
        case 'submitted': return 'bg-blue-500';
        case 'answered': return 'bg-green-500';
        default: return 'bg-slate-500';
      }
    case 'rfq':
      switch (status) {
        case 'sent': return 'bg-blue-500';
        case 'received': return 'bg-purple-500';
        case 'evaluated': return 'bg-orange-500';
        case 'awarded': return 'bg-green-500';
        default: return 'bg-slate-500';
      }
    case 'rfp':
      switch (status) {
        case 'published': return 'bg-blue-500';
        case 'reviewing': return 'bg-purple-500';
        case 'shortlisted': return 'bg-orange-500';
        case 'awarded': return 'bg-green-500';
        default: return 'bg-slate-500';
      }
    default:
      return 'bg-slate-500';
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString();
};

const RFITable: React.FC<RFITableProps> = ({ rfis, onViewRFI, requestType }) => {
  if (rfis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
        <p className="text-muted-foreground mb-4">No {requestType.toUpperCase()}s found</p>
        <p className="text-sm text-muted-foreground">Create a new {requestType.toUpperCase()} to get started</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rfis.map((rfi) => (
            <TableRow key={rfi.id}>
              <TableCell className="font-medium">{rfi.title}</TableCell>
              <TableCell>{rfi.category}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(rfi.status, requestType)}>
                  {rfi.status.charAt(0).toUpperCase() + rfi.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(rfi.dueDate)}</TableCell>
              <TableCell>{formatDate(rfi.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onViewRFI(rfi.id)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RFITable;
