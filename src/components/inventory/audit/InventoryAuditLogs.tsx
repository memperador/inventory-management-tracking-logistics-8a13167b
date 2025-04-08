
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Equipment } from '@/components/equipment/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Download, Filter, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LogEntry {
  id: string;
  timestamp: string;
  equipmentId?: string;
  equipmentName?: string;
  action: string;
  user: string;
  details: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

interface InventoryAuditLogsProps {
  equipmentData: Equipment[];
}

export const InventoryAuditLogs: React.FC<InventoryAuditLogsProps> = ({
  equipmentData
}) => {
  // Generate sample audit logs
  const generateSampleLogs = (): LogEntry[] => {
    const actions = [
      "Created", "Updated", "Status Changed", "Maintenance Scheduled", 
      "Checked Out", "Checked In", "Certification Updated", "Location Changed"
    ];
    
    const users = [
      "John Smith", "Maria Garcia", "Alex Johnson", "Sarah Lee", "Tom Wilson"
    ];
    
    return Array(20).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i % 14)); // Random dates within the last 2 weeks
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      const equipment = equipmentData[i % equipmentData.length];
      const action = actions[i % actions.length];
      const user = users[i % users.length];
      
      let changes;
      let details;
      
      if (action === "Updated" || action === "Status Changed" || action === "Location Changed") {
        const fields = ["status", "location", "nextMaintenance", "certificationExpiry"];
        const field = fields[i % fields.length];
        
        changes = [{
          field,
          oldValue: field === "status" ? "Maintenance" : field === "location" ? "Warehouse Project" : "2023-12-25",
          newValue: field === "status" ? "Operational" : field === "location" ? "Downtown High-rise" : "2024-06-30",
        }];
        
        details = `${field === "status" ? "Status" : field === "location" ? "Location" : field === "nextMaintenance" ? "Maintenance Date" : "Certification Date"} was updated`;
      } else {
        details = action === "Created" ? "New equipment item was added to inventory" :
                  action === "Maintenance Scheduled" ? "Maintenance scheduled for equipment" :
                  action === "Checked Out" ? "Equipment was checked out to a user" :
                  action === "Checked In" ? "Equipment was returned to inventory" :
                  "Equipment certification was updated";
      }
      
      return {
        id: `log-${i + 1}`,
        timestamp: date.toISOString(),
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        action,
        user,
        details,
        changes
      };
    });
  };
  
  const [logs, setLogs] = useState<LogEntry[]>(generateSampleLogs());
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [detailsDialog, setDetailsDialog] = useState<LogEntry | null>(null);

  const toggleLogExpansion = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = filterAction === null || log.action === filterAction;
    
    const matchesDate = filterDate === undefined || 
      new Date(log.timestamp).toDateString() === filterDate.toDateString();
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const exportLogs = () => {
    alert('Logs would be exported in a real implementation');
  };

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Inventory Audit Logs</h2>
        <Button variant="outline" onClick={exportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                {filterAction || 'Action'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterAction(null)}>
                All Actions
              </DropdownMenuItem>
              {uniqueActions.map(action => (
                <DropdownMenuItem key={action} onClick={() => setFilterAction(action)}>
                  {action}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-shrink-0",
                  !filterDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate ? format(filterDate, "PPP") : "Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={setFilterDate}
                initialFocus
              />
              {filterDate && (
                <div className="p-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFilterDate(undefined)}
                  >
                    Clear Date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Logs table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden md:table-cell">User</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <TableRow className="group">
                      <TableCell className="font-mono">
                        {new Date(log.timestamp).toLocaleDateString()}{' '}
                        <span className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </TableCell>
                      <TableCell>{log.equipmentName}</TableCell>
                      <TableCell>
                        <span className={
                          log.action === 'Created' ? 'text-green-600 dark:text-green-400' :
                          log.action.includes('Changed') || log.action.includes('Updated') ? 'text-blue-600 dark:text-blue-400' :
                          log.action === 'Checked Out' ? 'text-amber-600 dark:text-amber-400' :
                          ''
                        }>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{log.user}</TableCell>
                      <TableCell className="hidden md:table-cell truncate max-w-[200px]">{log.details}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleLogExpansion(log.id)}
                          >
                            {expandedLog === log.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDetailsDialog(log)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedLog === log.id && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={6} className="p-4">
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs">Equipment ID</Label>
                                <p className="text-sm font-mono">{log.equipmentId}</p>
                              </div>
                              <div>
                                <Label className="text-xs">User</Label>
                                <p className="text-sm">{log.user}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Details</Label>
                              <p className="text-sm">{log.details}</p>
                            </div>
                            {log.changes && log.changes.length > 0 && (
                              <div>
                                <Label className="text-xs">Changes</Label>
                                <div className="mt-1 border rounded-md overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-xs">Field</TableHead>
                                        <TableHead className="text-xs">Old Value</TableHead>
                                        <TableHead className="text-xs">New Value</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {log.changes.map((change, i) => (
                                        <TableRow key={i}>
                                          <TableCell className="py-1 text-xs">{change.field}</TableCell>
                                          <TableCell className="py-1 text-xs">{change.oldValue}</TableCell>
                                          <TableCell className="py-1 text-xs">{change.newValue}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No matching logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Details dialog */}
      <Dialog open={!!detailsDialog} onOpenChange={(open) => !open && setDetailsDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
          </DialogHeader>
          
          {detailsDialog && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Timestamp</Label>
                <div className="p-2 bg-muted rounded-md font-mono">
                  {new Date(detailsDialog.timestamp).toLocaleString()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Equipment</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {detailsDialog.equipmentName}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Equipment ID</Label>
                  <div className="p-2 bg-muted rounded-md font-mono">
                    {detailsDialog.equipmentId}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {detailsDialog.action}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>User</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {detailsDialog.user}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Details</Label>
                <div className="p-2 bg-muted rounded-md">
                  {detailsDialog.details}
                </div>
              </div>
              
              {detailsDialog.changes && detailsDialog.changes.length > 0 && (
                <div className="space-y-2">
                  <Label>Changes</Label>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Old Value</TableHead>
                          <TableHead>New Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailsDialog.changes.map((change, i) => (
                          <TableRow key={i}>
                            <TableCell>{change.field}</TableCell>
                            <TableCell>{change.oldValue}</TableCell>
                            <TableCell>{change.newValue}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
