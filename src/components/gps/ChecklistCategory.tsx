
import React from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  Collapsible, 
  CollapsibleTrigger,
  CollapsibleContent
} from '@/components/ui/collapsible';
import ChecklistItems from './ChecklistItems';
import { ChecklistItem } from './types';

interface ChecklistCategoryProps {
  name: string;
  description: string;
  isOpen: boolean;
  items: ChecklistItem[];
  onToggle: () => void;
  onCheckboxChange: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
}

const ChecklistCategory: React.FC<ChecklistCategoryProps> = ({
  name,
  description,
  isOpen,
  items,
  onToggle,
  onCheckboxChange,
  onDeleteItem
}) => {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onToggle}
    >
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="capitalize flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  {name}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              <div>
                {isOpen ? 
                  <ChevronUp className="h-5 w-5" /> : 
                  <ChevronDown className="h-5 w-5" />
                }
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ChecklistItems 
            items={items} 
            onCheckboxChange={onCheckboxChange}
            onDeleteItem={onDeleteItem} 
          />
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default ChecklistCategory;
