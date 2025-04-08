
import { z } from "zod";

export const rfiFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  dueDate: z.string().optional()
    .refine(val => !val || new Date(val) > new Date(), {
      message: "Due date must be in the future"
    }),
  attachments: z.array(z.instanceof(File))
    .optional()
    .refine(files => !files || files.length <= 5, {
      message: "Maximum of 5 files allowed"
    })
    .refine(files => !files || files.every(file => file.size <= 10 * 1024 * 1024), {
      message: "Each file must be less than 10MB"
    }),
  notifyParticipants: z.boolean().optional().default(false),
  responseRequired: z.boolean().optional().default(true),
});

export type RFIFormValues = z.infer<typeof rfiFormSchema>;

// Add validation schema for the inventory form
export const inventoryItemFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.string().min(2, 'Type is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  cost: z.string().optional().transform(val => (val ? parseFloat(val) : undefined)),
  purchaseDate: z.string().optional(),
  status: z.string().default('Operational'),
  csi_code: z.string().optional(),
  nec_code: z.string().optional(),
  assetTag: z.string().optional(),
  rfidType: z.enum(['none', 'active', 'passive']).default('none'),
  rfidTag: z.string().optional(),
  // Enhanced compliance fields with validation
  certificationRequired: z.boolean().optional().default(false),
  certificationExpiry: z.string().optional()
    .refine(
      (val, ctx) => {
        if (ctx.parent.certificationRequired && !val) {
          return false;
        }
        return true;
      },
      { message: "Certification expiry date is required when certification is required" }
    ),
  complianceNotes: z.string().optional(),
  lastInspection: z.string().optional(),
  nextInspection: z.string().optional()
    .refine(val => !val || new Date(val) > new Date(), {
      message: "Next inspection date must be in the future"
    }),
  complianceStatus: z.string().optional().default('Compliant'),
  // Document uploads with validation
  documents: z.array(z.instanceof(File))
    .optional()
    .refine(files => !files || files.length <= 10, {
      message: "Maximum of 10 files allowed"
    })
    .refine(files => !files || files.every(file => file.size <= 15 * 1024 * 1024), {
      message: "Each file must be less than 15MB"
    }),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>;

// Add schema for vendor webhook configuration
export const webhookConfigSchema = z.object({
  webhookUrl: z.string().url('Please enter a valid URL'),
  eventType: z.enum(['inventory_update', 'order_created', 'order_shipped', 'order_delivered']),
  isActive: z.boolean().default(true),
  secretKey: z.string().optional(),
  description: z.string().optional(),
});

export type WebhookConfigValues = z.infer<typeof webhookConfigSchema>;
