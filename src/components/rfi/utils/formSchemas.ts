
import { z } from "zod";

export const rfiFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  dueDate: z.string().optional(),
});

export type RFIFormValues = z.infer<typeof rfiFormSchema>;
