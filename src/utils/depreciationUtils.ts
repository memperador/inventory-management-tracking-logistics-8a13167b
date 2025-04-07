
import { differenceInMonths, parseISO } from 'date-fns';
import { Equipment } from '@/components/equipment/types';

// Depreciation rates by equipment type (yearly percentage)
const DEPRECIATION_RATES: Record<string, number> = {
  // Construction equipment
  'Earthmoving': 0.15, // 15% per year
  'Lifting': 0.12, // 12% per year
  'Concrete': 0.15,
  'Compaction': 0.20,
  
  // Electrical equipment
  'Power Tools': 0.20,
  'Testing Equipment': 0.25,
  'Generators': 0.15,
  'Electrical': 0.18,
  
  // Plumbing equipment
  'Plumbing': 0.15,
  'Pipe Handling': 0.18,
  
  // HVAC equipment
  'HVAC': 0.12,
  'Cooling': 0.15,
  'Heating': 0.15,
  
  // Default rate if type not found
  'default': 0.15 // 15% per year
};

// Salvage values by equipment type (percentage of original cost)
const SALVAGE_VALUES: Record<string, number> = {
  'Earthmoving': 0.20, // 20% of original value
  'Lifting': 0.15,
  'Generators': 0.15,
  'HVAC': 0.12,
  'default': 0.10 // 10% of original value
};

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
  
  // Get the appropriate depreciation rate for this equipment type
  const annualDepreciationRate = DEPRECIATION_RATES[equipment.type] || DEPRECIATION_RATES['default'];
  
  // Get the appropriate salvage value percentage for this equipment type
  const salvageValuePercentage = SALVAGE_VALUES[equipment.type] || SALVAGE_VALUES['default'];
  const salvageValue = equipment.cost * salvageValuePercentage;
  
  // If the equipment has exceeded its lifespan, the value is the salvage value
  if (ageInMonths >= lifespanInMonths) {
    return salvageValue;
  }
  
  // Calculate using declining balance method for more realistic industry values
  // This gives faster depreciation in early years
  const depreciableValue = equipment.cost - salvageValue;
  const monthlyDepreciationRate = annualDepreciationRate / 12;
  
  // Current value = original cost * (1 - rate)^months
  const currentValue = equipment.cost - (depreciableValue * (1 - Math.pow(1 - monthlyDepreciationRate, ageInMonths)));
  
  // Ensure value never goes below salvage value
  return Math.max(currentValue, salvageValue);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
