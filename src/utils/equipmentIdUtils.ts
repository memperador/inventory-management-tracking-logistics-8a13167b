
/**
 * Generates a formatted equipment ID with format: EQ-{tenant prefix}-{sequential number}
 * Example: EQ-ACM-0001
 */
export const generateEquipmentId = (tenantPrefix: string, sequentialNumber: number): string => {
  // Pad the sequential number to 4 digits
  const paddedNumber = String(sequentialNumber).padStart(4, '0');
  return `EQ-${tenantPrefix.toUpperCase()}-${paddedNumber}`;
};

/**
 * Validates if a string matches the equipment ID format
 */
export const isValidEquipmentId = (id: string): boolean => {
  const regex = /^EQ-[A-Z]{2,5}-\d{4}$/;
  return regex.test(id);
};

/**
 * Extracts the sequential number from an equipment ID
 */
export const getSequentialNumber = (id: string): number | null => {
  const match = id.match(/\d{4}$/);
  return match ? parseInt(match[0], 10) : null;
};
