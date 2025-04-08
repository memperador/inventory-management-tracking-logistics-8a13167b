
import React from 'react';
import { QRCodeGenerator } from '@/components/inventory/qrcode/QRCodeGenerator';
import { Equipment } from '@/components/equipment/types';

interface QRCodeTabContentProps {
  filteredEquipment: Equipment[];
}

export const QRCodeTabContent: React.FC<QRCodeTabContentProps> = ({
  filteredEquipment
}) => {
  return <QRCodeGenerator equipmentData={filteredEquipment} />;
};
