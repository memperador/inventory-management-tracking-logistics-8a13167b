
import React from 'react';
import { Equipment } from '@/components/equipment/types';
import { FormMessage } from '@/components/ui/form';

interface EquipmentSelectionListProps {
  equipmentList: Equipment[];
  selectedEquipmentId: string;
  onSelectEquipment: (id: string) => void;
}

export const EquipmentSelectionList: React.FC<EquipmentSelectionListProps> = ({
  equipmentList,
  selectedEquipmentId,
  onSelectEquipment,
}) => {
  return (
    <div className="border rounded-md overflow-auto max-h-[200px]">
      {equipmentList.length > 0 ? (
        <div className="divide-y">
          {equipmentList.map(item => (
            <div 
              key={item.id} 
              className={`p-2 cursor-pointer hover:bg-slate-100 flex justify-between items-center ${
                selectedEquipmentId === item.id ? 'bg-slate-100' : ''
              }`}
              onClick={() => onSelectEquipment(item.id)}
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {item.type} | {item.category || 'Uncategorized'}
                </div>
              </div>
              <div>
                <input 
                  type="radio" 
                  checked={selectedEquipmentId === item.id}
                  onChange={() => {}}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          No available equipment found matching your criteria
        </div>
      )}
    </div>
  );
};

export default EquipmentSelectionList;
