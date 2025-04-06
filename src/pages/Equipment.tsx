
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EquipmentFilters } from '@/components/equipment/EquipmentFilters';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { equipmentData } from '@/components/equipment/EquipmentData';

const Equipment = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter equipment based on search query
  const filteredEquipment = equipmentData.filter(
    equipment => 
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="text-gray-500 mt-1">Manage your equipment inventory</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>
      
      <EquipmentFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <EquipmentList equipmentData={filteredEquipment} />
    </div>
  );
};

export default Equipment;
