
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { RFI } from './types';

interface RFITableProps {
  rfis: RFI[];
  onViewRFI: (id: string) => void;
}

const getRFIStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-slate-500';
    case 'submitted':
      return 'bg-blue-500';
    case 'answered':
      return 'bg-green-500';
    case 'closed':
      return 'bg-gray-500';
    default:
      return 'bg-slate-500';
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString();
};

const RFITable: React.FC<RFITableProps> = ({ rfis, onViewRFI }) => {
  if (rfis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
        <p className="text-muted-foreground mb-4">No RFIs found</p>
        <p className="text-sm text-muted-foreground">Create a new RFI to get started</p>
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
                <Badge className={getRFIStatusColor(rfi.status)}>
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
