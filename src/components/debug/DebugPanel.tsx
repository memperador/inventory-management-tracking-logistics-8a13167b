
import React, { useState, useEffect } from 'react';
import { useDebugLogs } from '@/hooks/debug/useDebugLogs';
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
import { Search, Download, Trash2, RefreshCw, Bug } from 'lucide-react';
import { AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const DebugPanel = () => {
  const {
    logs,
    loading,
    fetchAllLogs,
    filterByPrefix,
    filterByLevel,
    search,
    fetchRecentLogs,
    clearLogs,
    downloadLogs
  } = useDebugLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Common log prefixes from our codebase
  const logPrefixes = ['AUTH', 'TRIAL', 'PAYMENT', 'MIGRATION', 'SUBSCRIPTION-CHECK', 'TENANT-MIGRATION'];
  
  useEffect(() => {
    if (isOpen) {
      fetchRecentLogs(50);
    }
  }, [isOpen, fetchRecentLogs]);
  
  useEffect(() => {
    let interval: number | undefined;
    if (isOpen && autoRefresh) {
      interval = window.setInterval(() => {
        fetchAllLogs();
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, autoRefresh, fetchAllLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(searchTerm);
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-500 text-white';
      case 'WARN': return 'bg-yellow-500 text-white';
      case 'INFO': return 'bg-blue-500 text-white';
      case 'DEBUG': return 'bg-gray-500 text-white';
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-md">
          <Bug size={16} />
          Debug Logs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 h-[80vh]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Debug Logs</DialogTitle>
          <DialogDescription>
            View and filter application logs for debugging
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 flex flex-col h-[calc(80vh-130px)]">
          <div className="flex items-center gap-2 mb-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                <Search size={18} />
              </Button>
            </form>
            
            <Select onValueChange={(value) => filterByLevel(value as keyof typeof AUTH_LOG_LEVELS)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Log Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {logPrefixes.map((prefix) => (
              <Button 
                key={prefix} 
                variant="outline" 
                size="sm"
                onClick={() => filterByPrefix(prefix)}
              >
                {prefix}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => fetchAllLogs()}>
              All Logs
            </Button>
          </div>

          <div className="flex-1 overflow-auto border rounded-md">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>No logs found</p>
              </div>
            ) : (
              <div className="divide-y">
                {logs.map((log, index) => (
                  <Card key={index} className="rounded-none border-0 border-b">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {formatTimestamp(log.timestamp)}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {log.prefix}
                          </Badge>
                          <Badge className={`${getBadgeColor(log.level)} text-xs`}>
                            {log.level}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm mb-1">{log.message}</p>
                      {log.data && (
                        <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
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
            <Button variant="outline" size="sm" onClick={() => fetchRecentLogs(50)}>
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearLogs}>
              <Trash2 size={16} /> Clear Logs
            </Button>
            <Button variant="outline" size="sm" onClick={downloadLogs}>
              <Download size={16} /> Download Logs
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DebugPanel;
