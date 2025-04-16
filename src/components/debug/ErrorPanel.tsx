
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { 
  ERROR_CATEGORIES, 
  ERROR_SEVERITY, 
  ConstructionErrorResponse,
  RECOVERY_STRATEGY
} from '@/utils/errorHandling/errorTypes';
import { getErrorHistory, filterErrors, getSeverityLabel } from '@/utils/errorHandling/errorService';
import { useToast } from '@/hooks/use-toast';

export const ErrorPanel = () => {
  const [errors, setErrors] = useState<ConstructionErrorResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchErrors();
    }
  }, [isOpen]);
  
  useEffect(() => {
    let interval: number | undefined;
    if (isOpen && autoRefresh) {
      interval = window.setInterval(() => {
        fetchErrors();
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, autoRefresh]);

  const fetchErrors = () => {
    setErrors(getErrorHistory());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchErrors();
      return;
    }
    
    const filteredErrors = errors.filter(error => 
      error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (error.technicalDetails && 
        error.technicalDetails.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setErrors(filteredErrors);
  };

  const handleFilterByCategory = (category: string) => {
    const filteredErrors = filterErrors({ 
      category: ERROR_CATEGORIES[category as keyof typeof ERROR_CATEGORIES] 
    });
    setErrors(filteredErrors);
  };

  const handleFilterBySeverity = (severity: string) => {
    if (severity === 'ALL') {
      fetchErrors();
      return;
    }
    
    const filteredErrors = filterErrors({ 
      severity: ERROR_SEVERITY[severity as keyof typeof ERROR_SEVERITY] 
    });
    setErrors(filteredErrors);
  };

  const handleClearErrors = () => {
    // We can't actually clear the error store, but we can clear the local state
    setErrors([]);
    toast({
      title: 'Errors List Cleared',
      description: 'The error list has been cleared from view',
    });
  };

  const handleDownloadErrors = () => {
    try {
      const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `construction-errors-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Errors Downloaded',
        description: 'Error log has been downloaded as JSON',
      });
    } catch (e) {
      console.error('Failed to download errors:', e);
    }
  };

  const getBadgeColor = (severity: string) => {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL: return 'bg-red-500 text-white';
      case ERROR_SEVERITY.HIGH: return 'bg-red-400 text-white';
      case ERROR_SEVERITY.MEDIUM: return 'bg-yellow-500 text-white';
      case ERROR_SEVERITY.LOW: return 'bg-blue-500 text-white';
      case ERROR_SEVERITY.INFO: return 'bg-gray-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getRecoveryStrategyLabel = (strategy: keyof typeof RECOVERY_STRATEGY) => {
    switch (strategy) {
      case 'AUTO_RETRY': return 'Auto Retry';
      case 'MANUAL_INTERVENTION': return 'Manual Fix Required';
      case 'FALLBACK': return 'Using Fallback';
      case 'ABORT': return 'Operation Aborted';
      case 'NOTIFY': return 'Notification Only';
      default: return strategy;
    }
  };

  const getCategoryBadge = (category: keyof typeof ERROR_CATEGORIES) => {
    const badgeColors: Record<keyof typeof ERROR_CATEGORIES, string> = {
      SAFETY: 'bg-red-100 text-red-800 border-red-200',
      COMPLIANCE: 'bg-purple-100 text-purple-800 border-purple-200',
      EQUIPMENT: 'bg-blue-100 text-blue-800 border-blue-200',
      WORKFLOW: 'bg-green-100 text-green-800 border-green-200',
      COMMUNICATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SYSTEM: 'bg-gray-100 text-gray-800 border-gray-200',
      SECURITY: 'bg-orange-100 text-orange-800 border-orange-200',
      AUTH: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    
    return (
      <Badge variant="outline" className={`${badgeColors[category]} font-mono text-xs`}>
        {category}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 shadow-md">
          <AlertTriangle size={16} />
          Error Center
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 h-[80vh]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Construction Site Error Center</DialogTitle>
          <DialogDescription>
            View and manage application errors with construction industry context
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 flex flex-col h-[calc(80vh-130px)]">
          <div className="flex items-center gap-2 mb-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search size={18} />
              </Button>
            </form>
            
            <Select onValueChange={handleFilterBySeverity}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Severities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {Object.keys(ERROR_CATEGORIES).map((category) => (
              <Button 
                key={category} 
                variant="outline" 
                size="sm"
                onClick={() => handleFilterByCategory(category)}
              >
                {category}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={fetchErrors}>
              All Errors
            </Button>
          </div>

          <Tabs defaultValue="list" className="flex-1 flex flex-col">
            <TabsList className="mb-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="details">Detail View</TabsTrigger>
              <TabsTrigger value="stats">Error Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="flex-1 border rounded-md overflow-hidden">
              <div className="overflow-auto h-full">
                {errors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <AlertTriangle className="h-12 w-12 opacity-20 mb-2" />
                    <p>No errors found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {errors.map((error, index) => (
                      <Card key={error.id || index} className="rounded-none border-0 border-b">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {formatTimestamp(error.timestamp)}
                              </Badge>
                              {getCategoryBadge(error.category as keyof typeof ERROR_CATEGORIES)}
                              <Badge className={`${getBadgeColor(error.severity)} text-xs`}>
                                {error.severity}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs">
                              {error.code}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{error.message}</p>
                          {error.userGuidance && (
                            <p className="text-xs text-muted-foreground mb-1">
                              <span className="font-medium">Guidance:</span> {error.userGuidance}
                            </p>
                          )}
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{error.location || 'Unknown location'}</span>
                            <span>{getRecoveryStrategyLabel(error.recoveryStrategy as keyof typeof RECOVERY_STRATEGY)}</span>
                          </div>
                          {error.technicalDetails && (
                            <details className="mt-1 text-xs">
                              <summary className="cursor-pointer">Technical details</summary>
                              <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                                {error.technicalDetails}
                              </pre>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="flex-1 border rounded-md overflow-hidden">
              {errors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>No errors to display</p>
                </div>
              ) : (
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-4">Selected Error Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Error Information</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Code:</span> {errors[0].code}</p>
                          <p><span className="font-medium">Message:</span> {errors[0].message}</p>
                          <p><span className="font-medium">Severity:</span> {getSeverityLabel(errors[0].severity)}</p>
                          <p><span className="font-medium">Category:</span> {errors[0].category}</p>
                          <p><span className="font-medium">Time:</span> {new Date(errors[0].timestamp).toLocaleString()}</p>
                          <p><span className="font-medium">Location:</span> {errors[0].location || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Recovery Information</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Strategy:</span> {getRecoveryStrategyLabel(errors[0].recoveryStrategy as keyof typeof RECOVERY_STRATEGY)}</p>
                          {errors[0].userGuidance && <p><span className="font-medium">Guidance:</span> {errors[0].userGuidance}</p>}
                          {errors[0].requiredRoles && errors[0].requiredRoles.length > 0 && (
                            <p><span className="font-medium">Required Roles:</span> {errors[0].requiredRoles.join(', ')}</p>
                          )}
                          {errors[0].relatedRegulations && errors[0].relatedRegulations.length > 0 && (
                            <p><span className="font-medium">Related Regulations:</span> {errors[0].relatedRegulations.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {errors[0].technicalDetails && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Technical Details</h4>
                        <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-auto max-h-56">
                          {errors[0].technicalDetails}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="stats" className="flex-1 border rounded-md overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">Error Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">By Category</h4>
                    <div className="space-y-2">
                      {Object.keys(ERROR_CATEGORIES).map(category => {
                        const count = errors.filter(err => 
                          err.category === ERROR_CATEGORIES[category as keyof typeof ERROR_CATEGORIES]
                        ).length;
                        
                        return (
                          <div key={category} className="flex justify-between items-center text-sm">
                            <span>{category}</span>
                            <Badge>{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">By Severity</h4>
                    <div className="space-y-2">
                      {Object.keys(ERROR_SEVERITY).map(severity => {
                        const count = errors.filter(err => 
                          err.severity === ERROR_SEVERITY[severity as keyof typeof ERROR_SEVERITY]
                        ).length;
                        
                        return (
                          <div key={severity} className="flex justify-between items-center text-sm">
                            <span>{getSeverityLabel(ERROR_SEVERITY[severity as keyof typeof ERROR_SEVERITY])}</span>
                            <Badge className={getBadgeColor(ERROR_SEVERITY[severity as keyof typeof ERROR_SEVERITY])}>
                              {count}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-4 border-t flex justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-blue-50" : ""}
            >
              <RefreshCw size={16} className={autoRefresh ? "animate-spin" : ""} />
              {autoRefresh ? "Auto-refresh On" : "Auto-refresh"}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchErrors}>
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClearErrors}>
              <Trash2 size={16} /> Clear List
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadErrors}>
              <Download size={16} /> Download Logs
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorPanel;
