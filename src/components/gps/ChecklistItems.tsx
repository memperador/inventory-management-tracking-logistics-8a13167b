
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { ChecklistItem } from './types';

interface ChecklistItemsProps {
  items: ChecklistItem[];
  onCheckboxChange: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
}

const ChecklistItems: React.FC<ChecklistItemsProps> = ({
  items,
  onCheckboxChange,
  onDeleteItem
}) => {
  return (
    <CardContent>
      <ul className="space-y-4">
        {items.length > 0 ? (
          items.map(item => (
            <li key={item.id} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={item.completed}
                  onCheckedChange={() => onCheckboxChange(item.id)}
                />
                <label
                  htmlFor={`item-${item.id}`}
                  className={`${item.completed ? 'line-through text-gray-400' : ''}`}
                >
                  {item.text}
                </label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4 text-gray-500" />
              </Button>
            </li>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">
            No items in this category. Add some above.
          </p>
        )}
      </ul>
    </CardContent>
  );
};

export default ChecklistItems;
