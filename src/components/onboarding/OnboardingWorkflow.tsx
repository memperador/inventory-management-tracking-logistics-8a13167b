
import React, { useMemo } from 'react';
import { Edge, Node } from '@xyflow/react';
import WorkflowVisualizer from '@/components/workflow/WorkflowVisualizer';
import { useOnboardingState } from './hooks/useOnboardingState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingStep } from './types';
import { useNavigate } from 'react-router-dom';

const OnboardingWorkflow: React.FC = () => {
  const { onboardingState } = useOnboardingState();
  const navigate = useNavigate();
  
  // Generate workflow nodes based on current onboarding progress
  const nodes: Node[] = useMemo(() => {
    return [
      {
        id: 'start',
        type: 'custom',
        data: { 
          label: 'Start Onboarding', 
          status: 'completed' 
        },
        position: { x: 250, y: 0 },
      },
      ...onboardingState.steps.map((step: OnboardingStep, index: number) => ({
        id: step.id,
        type: 'custom',
        data: { 
          label: step.title, 
          status: step.completed ? 'completed' : 
                  index === onboardingState.currentStepIndex ? 'pending' : 'pending'
        },
        position: { x: 250, y: (index + 1) * 100 },
      })),
      {
        id: 'complete',
        type: 'custom',
        data: { 
          label: 'Onboarding Complete', 
          status: onboardingState.isComplete ? 'completed' : 'pending'
        },
        position: { x: 250, y: (onboardingState.steps.length + 1) * 100 },
      }
    ];
  }, [onboardingState]);
  
  // Generate edges connecting all nodes
  const edges: Edge[] = useMemo(() => {
    const allNodeIds = ['start', ...onboardingState.steps.map(step => step.id), 'complete'];
    
    return allNodeIds.slice(0, -1).map((sourceId, index) => ({
      id: `edge-${sourceId}-to-${allNodeIds[index + 1]}`,
      source: sourceId,
      target: allNodeIds[index + 1],
      animated: true,
    }));
  }, [onboardingState.steps]);
  
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    // Navigate to appropriate page when node is clicked
    if (node.id === 'org-profile') {
      navigate('/settings');
    } else if (node.id === 'industry-codes') {
      navigate('/onboarding');
    } else if (node.id === 'import-inventory') {
      navigate('/inventory');
    } else if (node.id === 'setup-alerts') {
      navigate('/inventory?tab=alerts');
    } else if (node.id === 'invite-team') {
      navigate('/users');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Onboarding Workflow</CardTitle>
        <CardDescription>Visual representation of your onboarding progress</CardDescription>
      </CardHeader>
      <CardContent>
        <WorkflowVisualizer 
          initialNodes={nodes}
          initialEdges={edges} 
          readOnly={true}
          onNodeClick={handleNodeClick}
        />
      </CardContent>
    </Card>
  );
};

export default OnboardingWorkflow;
