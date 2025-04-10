
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChecklistItemStatus } from '../../types/preConstructionTypes';
import { statusLabels, statusIcons } from './StatusBadge';

interface StatusFilterProps {
  selectedStatus: ChecklistItemStatus | 'all';
  onStatusChange: (status: ChecklistItemStatus | 'all') => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatus, onStatusChange }) => {
  return (
    <div className="mb-4">
      <div className="text-sm font-medium mb-2">Filter by status:</div>
      <ToggleGroup type="single" value={selectedStatus} onValueChange={(value) => {
        if (value) onStatusChange(value as ChecklistItemStatus | 'all');
      }}>
        <ToggleGroupItem value="all" className="text-xs">
          All Tasks
        </ToggleGroupItem>
        <ToggleGroupItem value="pending" className="text-xs flex items-center gap-1">
          {statusIcons['pending']}
          {statusLabels['pending']}
        </ToggleGroupItem>
        <ToggleGroupItem value="in-progress" className="text-xs flex items-center gap-1">
          {statusIcons['in-progress']}
          {statusLabels['in-progress']}
        </ToggleGroupItem>
        <ToggleGroupItem value="completed" className="text-xs flex items-center gap-1">
          {statusIcons['completed']}
          {statusLabels['completed']}
        </ToggleGroupItem>
        <ToggleGroupItem value="not-required" className="text-xs flex items-center gap-1">
          {statusIcons['not-required']}
          {statusLabels['not-required']}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default StatusFilter;
