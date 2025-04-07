
import { z } from 'zod';

export const inventoryItemFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  cost: z.string().optional().transform(val => (val ? parseFloat(val) : undefined)),
  purchaseDate: z.string().optional(),
  status: z.string().default('Operational')
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>;
