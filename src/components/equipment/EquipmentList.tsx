
import React from 'react';
import { EquipmentCard } from './EquipmentCard';
import { Equipment } from './types';

interface EquipmentListProps {
  equipmentData: Equipment[];
}

export const EquipmentList: React.FC<EquipmentListProps> = ({ equipmentData }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {equipmentData.map((equipment) => (
        <EquipmentCard key={equipment.id} equipment={equipment} />
      ))}
    </div>
  );
};
