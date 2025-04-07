
import { differenceInMonths, parseISO } from 'date-fns';
import { Equipment } from '@/components/equipment/types';

export const calculateDepreciation = (equipment: Equipment): number => {
  // If no cost, purchase date or lifespan is defined, return 0
  if (!equipment.cost || !equipment.purchaseDate || !equipment.lifespan) {
    return 0;
  }

  const today = new Date();
  const purchaseDate = parseISO(equipment.purchaseDate);
  
  // Calculate age in months
  const ageInMonths = differenceInMonths(today, purchaseDate);
  
  // Calculate lifespan in months
  const lifespanInMonths = equipment.lifespan * 12;
  
  // If the equipment has exceeded its lifespan, the value is the salvage value (10% of original cost)
  if (ageInMonths >= lifespanInMonths) {
    return equipment.cost * 0.1; // Assuming 10% salvage value
  }
  
  // Calculate depreciated value using straight-line depreciation
  const monthlyDepreciation = (equipment.cost * 0.9) / lifespanInMonths; // Depreciating 90% of the value
  const totalDepreciation = monthlyDepreciation * ageInMonths;
  
  // Current value = original cost - depreciation (but not less than salvage value)
  return Math.max(equipment.cost - totalDepreciation, equipment.cost * 0.1);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
