import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckSquare, FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from '@/utils/uuid';
import { Badge } from '@/components/projects/testing/Badge';

interface TestCase {
  id: string;
  feature: string;
  description: string;
  status: 'pending' | 'passed' | 'failed';
  notes?: string;
  assignedTo?: string;
  lastTested?: string;
}

interface TestingScheduleProps {
  projectId: string;
}

const defaultTestCases: TestCase[] = [
  {
    id: 'tc-1',
    feature: 'Project Creation',
    description: 'Test the ability to create a new project with all required fields',
    status: 'pending'
  },
  {
    id: 'tc-2',
    feature: 'Inventory Management',
    description: 'Test adding, editing, and removing inventory items',
    status: 'pending'
  },
  {
    id: 'tc-3',
    feature: 'Pre-Construction Checklist',
    description: 'Test adding, updating, and completing pre-construction tasks',
    status: 'pending'
  },
  {
    id: 'tc-4',
    feature: 'GPS Tracking',
    description: 'Test the equipment location tracking functionality',
    status: 'pending'
  },
  {
    id: 'tc-5',
    feature: 'AI Assistant',
    description: 'Test the AI assistant responses and interactions',
    status: 'pending'
  }
];

const featureCategories = [
  'Project Creation',
  'Inventory Management',
  'Pre-Construction',
  'GPS Tracking',
  'AI Assistant',
  'User Management',
  'Reporting',
  'Integration',
  'Other'
];

const TestingSchedule: React.FC<TestingScheduleProps> = ({ projectId }) => {
  const [testCases, setTestCases] = useState<TestCase[]>(defaultTestCases);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTestCase, setNewTestCase] = useState<Partial<TestCase>>({
    feature: '',
    description: '',
    status: 'pending'
  });
  const [filter, setFilter] = useState<string | null>(null);
  const { toast } = useToast();

  const handleToggleStatus = (id: string, newStatus: 'pending' | 'passed' | 'failed') => {
    setTestCases(prev => 
      prev.map(testCase => 
        testCase.id === id 
          ? { ...testCase, status: newStatus, lastTested: new Date().toISOString() } 
          : testCase
      )
    );
    
    toast({
      title: "Test status updated",
      description: `Test case marked as ${newStatus}`
    });
  };

  const handleAddTestCase = () => {
    if (!newTestCase.feature || !newTestCase.description) {
      toast({
        title: "Error",
        description: "Feature and description are required",
        variant: "destructive"
      });
      return;
    }

    const testCase: TestCase = {
      id: uuidv4(),
      feature: newTestCase.feature,
      description: newTestCase.description,
      status: 'pending',
      notes: newTestCase.notes,
      assignedTo: newTestCase.assignedTo
    };

    setTestCases(prev => [...prev, testCase]);
    setIsAddDialogOpen(false);
    setNewTestCase({
      feature: '',
      description: '',
      status: 'pending'
    });

    toast({
      title: "Test case added",
      description: "New test case has been added to the schedule"
    });
  };

  const filteredTestCases = filter 
    ? testCases.filter(testCase => testCase.feature === filter)
    : testCases;

  const passedCount = testCases.filter(tc => tc.status === 'passed').length;
  const progress = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Testing Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-sm">
                Progress: {passedCount}/{testCases.length} ({progress}%)
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Test Case
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={filter === null ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => setFilter(null)}
            >
              All
            </Button>
            {featureCategories.map(category => (
              <Button 
                key={category}
                variant={filter === category ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="space-y-3 mt-4">
            {filteredTestCases.map(testCase => (
              <Card key={testCase.id} className="border-l-4" style={{
                borderLeftColor: testCase.status === 'passed' ? '#10b981' : 
                                testCase.status === 'failed' ? '#ef4444' : 
                                '#f59e0b'
              }}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{testCase.feature}</Badge>
                        <h4 className="font-medium">{testCase.description}</h4>
                      </div>
                      {testCase.notes && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                          <FileText className="h-4 w-4 mt-0.5" />
                          <span>{testCase.notes}</span>
                        </div>
                      )}
                      {testCase.lastTested && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Last tested: {new Date(testCase.lastTested).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={testCase.status === 'pending' ? "outline" : "ghost"}
                        size="sm"
                        onClick={() => handleToggleStatus(testCase.id, 'pending')}
                      >
                        Pending
                      </Button>
                      <Button
                        variant={testCase.status === 'passed' ? "default" : "outline"}
                        size="sm"
                        className={testCase.status === 'passed' ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                        onClick={() => handleToggleStatus(testCase.id, 'passed')}
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Pass
                      </Button>
                      <Button
                        variant={testCase.status === 'failed' ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleToggleStatus(testCase.id, 'failed')}
                      >
                        Fail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Test Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feature">Feature Category</Label>
              <select
                id="feature"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newTestCase.feature}
                onChange={(e) => setNewTestCase({...newTestCase, feature: e.target.value})}
              >
                <option value="">Select a feature category</option>
                {featureCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Test Description</Label>
              <Textarea 
                id="description" 
                value={newTestCase.description} 
                onChange={(e) => setNewTestCase({...newTestCase, description: e.target.value})}
                placeholder="Describe the test case..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={newTestCase.notes || ''} 
                onChange={(e) => setNewTestCase({...newTestCase, notes: e.target.value})}
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
              <Input 
                id="assignedTo" 
                value={newTestCase.assignedTo || ''} 
                onChange={(e) => setNewTestCase({...newTestCase, assignedTo: e.target.value})}
                placeholder="Enter name of tester..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTestCase}>Add Test Case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestingSchedule;
