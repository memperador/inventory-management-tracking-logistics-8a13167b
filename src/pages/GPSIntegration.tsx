
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { MapPin, ChevronDown, ChevronUp, Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
  category: string;
};

type ChecklistCategory = {
  name: string;
  description: string;
  isOpen: boolean;
};

const GPSIntegration: React.FC = () => {
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('hardware');
  
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

  const addNewItem = () => {
    if (!newItemText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive"
      });
      return;
    }
    
    const newItem: ChecklistItem = {
      id: `new-${Date.now()}`,
      text: newItemText,
      completed: false,
      category: selectedCategory
    };
    
    setChecklistItems([...checklistItems, newItem]);
    setNewItemText('');
    
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GPS Integration Checklist</h1>
          <p className="text-gray-500 mt-1">Track your GPS hardware integration progress</p>
        </div>
        <Button onClick={saveChecklist} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Checklist'}
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
            <CardDescription>Create a new checklist item for your GPS integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter new checklist item..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                    </option>
                  ))}
                </select>
                <Button onClick={addNewItem}>
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {categories.map((category) => (
          <Collapsible
            key={category.name}
            open={category.isOpen}
            onOpenChange={() => toggleCategory(category.name)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="capitalize flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-primary" />
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                    <div>
                      {category.isOpen ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <ul className="space-y-4">
                    {checklistItems
                      .filter(item => item.category === category.name)
                      .map(item => (
                        <li key={item.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`item-${item.id}`}
                              checked={item.completed}
                              onCheckedChange={() => handleCheckboxChange(item.id)}
                            />
                            <label
                              htmlFor={`item-${item.id}`}
                              className={`${
                                item.completed ? 'line-through text-gray-400' : ''
                              }`}
                            >
                              {item.text}
                            </label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </li>
                      ))}
                    {checklistItems.filter(item => item.category === category.name).length === 0 && (
                      <p className="text-gray-400 text-center py-4">
                        No items in this category. Add some above.
                      </p>
                    )}
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default GPSIntegration;
