
import React from 'react';
import { Button } from '@/components/ui/button';
import { Info, Users, Loader } from 'lucide-react';

interface DebugActionsProps {
  onViewLogs: () => void;
  onFetchDebugInfo: () => void;
  loading: boolean;
}

const DebugActions: React.FC<DebugActionsProps> = ({ 
  onViewLogs, 
  onFetchDebugInfo,
  loading 
}) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">Migration Debug Tools</h3>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewLogs}
          disabled={loading}
        >
          <Info className="mr-2 h-4 w-4" />
          View Auth Logs
        </Button>
        
        <Button 
          onClick={onFetchDebugInfo} 
          size="sm"
          disabled={loading}
        >
          {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
          {loading ? 'Fetching...' : 'Get Tenant & User Info'}
        </Button>
      </div>
    </div>
  );
};

export default DebugActions;
