
import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from 'lucide-react';

interface EquipmentIdInfoProps {
  id: string;
}

export const EquipmentIdInfo: React.FC<EquipmentIdInfoProps> = ({ id }) => {
  const [prefix, tenantCode, number] = id.split('-');

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center cursor-help">
          <span className="mr-1">{id}</span>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Equipment ID Format</h4>
          <div className="text-sm text-muted-foreground">
            <p>The ID is composed of three parts:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><span className="font-mono text-primary">{prefix}</span>: Equipment prefix</li>
              <li><span className="font-mono text-primary">{tenantCode}</span>: Organization identifier</li>
              <li><span className="font-mono text-primary">{number}</span>: Sequential number (5 digits)</li>
            </ul>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
