
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ChecklistCategory } from './types';

interface AddTaskFormProps {
  categories: ChecklistCategory[];
  onAddItem: (text: string, category: string) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ categories, onAddItem }) => {
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || '');

  const handleAddItem = () => {
    if (!newItemText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive"
      });
      return;
    }
    
    onAddItem(newItemText, selectedCategory);
    setNewItemText('');
  };

  return (
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
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddTaskForm;
