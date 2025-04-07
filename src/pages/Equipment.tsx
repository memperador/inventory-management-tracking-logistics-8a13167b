
import React, { useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EquipmentFilters } from '@/components/equipment/EquipmentFilters';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { EquipmentListView } from '@/components/equipment/EquipmentListView';
import { equipmentData } from '@/components/equipment/EquipmentData';

type ViewMode = 'grid' | 'list';

const Equipment = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Show only Heavy Equipment in this view to differentiate from the Inventory page
  const heavyEquipment = equipmentData.filter(
    equipment => 
      (!equipment.category || equipment.category === 'Heavy Equipment') &&
      (equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="text-gray-500 mt-1">Manage your heavy equipment inventory</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <EquipmentFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <EquipmentList equipmentData={heavyEquipment} />
      ) : (
        <EquipmentListView equipmentData={heavyEquipment} />
      )}
    </div>
  );
};

export default Equipment;
