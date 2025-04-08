
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChecklistItem, ChecklistCategory } from '@/components/gps/types';
import AddTaskForm from '@/components/gps/AddTaskForm';
import ChecklistCategoryComponent from '@/components/gps/ChecklistCategory';
import MapVisualization from '@/components/gps/MapVisualization';
import GPSIntelligence from '@/components/gps/GPSIntelligence';

interface GPSIntegrationProps {
  simplified?: boolean;
}

const GPSIntegration: React.FC<GPSIntegrationProps> = ({ simplified = false }) => {
  const [categories, setCategories] = useState<ChecklistCategory[]>([
    { 
      name: 'hardware', 
      description: 'Physical GPS devices and installation', 
      isOpen: true 
    },
    { 
      name: 'software', 
      description: 'API integration and data processing', 
      isOpen: false 
    },
    { 
      name: 'testing', 
      description: 'Validation and quality assurance', 
      isOpen: false 
    },
    { 
      name: 'deployment', 
      description: 'Rollout and staff training', 
      isOpen: false 
    }
  ]);

  const initialItems: ChecklistItem[] = [
    { id: '1', text: 'Research GPS hardware options compatible with construction equipment', completed: false, category: 'hardware' },
    { id: '2', text: 'Compare battery life and durability specifications', completed: false, category: 'hardware' },
    { id: '3', text: 'Test GPS signal strength in typical work environments', completed: false, category: 'hardware' },
    { id: '4', text: 'Evaluate waterproof and dustproof ratings', completed: false, category: 'hardware' },
    { id: '5', text: 'Research API documentation for GPS providers', completed: false, category: 'software' },
    { id: '6', text: 'Design database schema for GPS location history', completed: false, category: 'software' },
    { id: '7', text: 'Implement real-time location updates', completed: false, category: 'software' },
    { id: '8', text: 'Create geofencing functionality', completed: false, category: 'software' },
    { id: '9', text: 'Test GPS accuracy at different locations', completed: false, category: 'testing' },
    { id: '10', text: 'Verify battery life in field conditions', completed: false, category: 'testing' },
    { id: '11', text: 'Test integration with equipment database', completed: false, category: 'testing' },
    { id: '12', text: 'Train staff on hardware installation', completed: false, category: 'deployment' },
    { id: '13', text: 'Document integration process', completed: false, category: 'deployment' },
    { id: '14', text: 'Create user guides for GPS tracking features', completed: false, category: 'deployment' }
  ];
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(initialItems);
  const [loading, setLoading] = useState(false);

  // In a real implementation, this would load from Supabase
  useEffect(() => {
    // This would fetch data from Supabase in a real implementation
    console.log('Loading checklist items would happen here');
    // For now, we're using the initialItems defined above
  }, []);

  const toggleCategory = (categoryName: string) => {
    setCategories(categories.map(category => 
      category.name === categoryName 
        ? { ...category, isOpen: !category.isOpen } 
        : category
    ));
  };

  const handleCheckboxChange = (itemId: string) => {
    setChecklistItems(checklistItems.map(item => 
      item.id === itemId 
        ? { ...item, completed: !item.completed } 
        : item
    ));
  };

  const addNewItem = (text: string, category: string) => {
    const newItem: ChecklistItem = {
      id: `new-${Date.now()}`,
      text,
      completed: false,
      category
    };
    
    setChecklistItems([...checklistItems, newItem]);
    
    toast({
      title: "Task Added",
      description: "New checklist item has been added"
    });
  };

  const deleteItem = (itemId: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== itemId));
    
    toast({
      title: "Task Deleted",
      description: "Checklist item has been removed"
    });
  };

  const saveChecklist = async () => {
    setLoading(true);
    try {
      // This would save to Supabase in a real implementation
      console.log('Saving checklist:', checklistItems);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Checklist Saved",
        description: "Your GPS integration checklist has been saved"
      });
    } catch (error) {
      console.error('Error saving checklist:', error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your checklist",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // If simplified mode is enabled (used in inventory GPS tab)
  if (simplified) {
    return (
      <div className="space-y-6">
        <MapVisualization />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GPS Integration</h1>
          <p className="text-gray-500 mt-1">Track equipment location and manage integration tasks</p>
        </div>
        <Button onClick={saveChecklist} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="map">Map Visualization</TabsTrigger>
          <TabsTrigger value="checklist">Implementation Checklist</TabsTrigger>
          <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-6">
          <MapVisualization />
        </TabsContent>
        
        <TabsContent value="checklist" className="mt-6">
          <div className="grid gap-6">
            <AddTaskForm 
              categories={categories}
              onAddItem={addNewItem}
            />
            
            {categories.map((category) => (
              <ChecklistCategoryComponent
                key={category.name}
                name={category.name}
                description={category.description}
                isOpen={category.isOpen}
                items={checklistItems.filter(item => item.category === category.name)}
                onToggle={() => toggleCategory(category.name)}
                onCheckboxChange={handleCheckboxChange}
                onDeleteItem={deleteItem}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="intelligence" className="mt-6">
          <GPSIntelligence />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GPSIntegration;
