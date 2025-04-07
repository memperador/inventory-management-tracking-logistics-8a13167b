
import { z } from "zod";

export const rfiFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
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
});

export type RFIFormValues = z.infer<typeof rfiFormSchema>;
