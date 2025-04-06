
import React, { useState } from 'react';
import WorkflowVisualizer from '@/components/workflow/WorkflowVisualizer';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const WorkflowPage: React.FC = () => {
  const { toast } = useToast();
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  
  // Mock workflow steps
  const [workflowSteps, setWorkflowSteps] = useState([
    { id: 'start', label: 'Initiate Process', status: 'pending' },
    { id: 'verify', label: 'Verify Data', status: 'pending' },
    { id: 'process', label: 'Process Request', status: 'pending' },
    { id: 'payment', label: 'Payment Processing', status: 'pending' },
    { id: 'complete', label: 'Complete Workflow', status: 'pending' },
  ]);

  // Generate React Flow nodes from workflow steps
  const getNodes = (): Node[] => {
    return workflowSteps.map((step, index) => ({
      id: step.id,
      type: 'custom',
      data: { 
        label: step.label, 
        status: step.status as 'pending' | 'completed' | 'error'
      },
      position: { x: 250, y: index * 100 },
    }));
  };

  // Handle node click
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    toast({
      title: `Step: ${node.data.label}`,
      description: `Current status: ${node.data.status}`,
    });
  };

  // Simulate workflow execution
  const runWorkflow = async () => {
    if (workflowStatus === 'running') return;
    
    setWorkflowStatus('running');
    
    // Update steps one by one with delays
    for (let i = 0; i < workflowSteps.length; i++) {
      try {
        // Update current step to pending
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate a random failure at the payment step (for demo purposes)
        if (workflowSteps[i].id === 'payment' && Math.random() < 0.3) {
          setWorkflowSteps(current => 
            current.map((step, idx) => 
              idx === i ? { ...step, status: 'error' } : step
            )
          );
          
          toast({
            title: "Workflow Failed",
            description: "Payment processing step encountered an error",
            variant: "destructive",
          });
          
          setWorkflowStatus('failed');
          return;
        }
        
        // Mark step as completed
        setWorkflowSteps(current => 
          current.map((step, idx) => 
            idx === i ? { ...step, status: 'completed' } : step
          )
        );
      } catch (error) {
        console.error(`Error in workflow step ${i}:`, error);
        
        setWorkflowSteps(current => 
          current.map((step, idx) => 
            idx === i ? { ...step, status: 'error' } : step
          )
        );
        
        setWorkflowStatus('failed');
        return;
      }
    }
    
    setWorkflowStatus('completed');
    toast({
      title: "Workflow Completed",
      description: "All workflow steps have finished successfully",
    });
  };

  // Reset the workflow
  const resetWorkflow = () => {
    setWorkflowSteps(current => 
      current.map(step => ({ ...step, status: 'pending' }))
    );
    setWorkflowStatus('idle');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Workflow Visualization</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Process Flow</CardTitle>
              <CardDescription>Visualization of the current workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowVisualizer 
                initialNodes={getNodes()}
                onNodeClick={handleNodeClick}
                readOnly={workflowStatus === 'running'}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Workflow Controls</CardTitle>
              <CardDescription>Manage workflow execution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Current Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    workflowStatus === 'idle' ? 'bg-gray-400' :
                    workflowStatus === 'running' ? 'bg-blue-500 animate-pulse' :
                    workflowStatus === 'completed' ? 'bg-green-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="capitalize">{workflowStatus}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Steps Completed</div>
                <div className="text-2xl font-bold">
                  {workflowSteps.filter(step => step.status === 'completed').length} 
                  <span className="text-sm text-muted-foreground">/ {workflowSteps.length}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={runWorkflow}
                disabled={workflowStatus === 'running'}
                className="w-full"
              >
                {workflowStatus === 'running' ? 'Processing...' : 'Run Workflow'}
              </Button>
              
              {(workflowStatus === 'completed' || workflowStatus === 'failed') && (
                <Button
                  onClick={resetWorkflow}
                  variant="outline"
                  className="w-full"
                >
                  Reset Workflow
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
