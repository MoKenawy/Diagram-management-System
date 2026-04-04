import { z } from 'zod';


export const createDiagramSchema = z.object({
  file: z.instanceof(File, { message: 'يجب إرفاق ملف' }),
  title: z.string().min(3, 'العنوان يجب أن يكون أكثر من 3 حروف'),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'القسم مطلوب'),
  tags: z.array(z.string()).default([]),
  revisionLabel: z.string().min(1, 'رقم الإصدار مطلوب'),
  changeSummary: z.string().min(1, 'ملخص التغييرات مطلوب'),
  uploadDate: z.date(),
  userAccess: z.array(z.string()).default([]),
  departmentAccess: z.array(z.string()).default([]),
});

export type CreateDiagramFormValues = z.infer<typeof createDiagramSchema>;

export const uploadRevisionSchema = z.object({
  file: z.instanceof(File, { message: 'يجب إرفاق ملف' }),
  revisionLabel: z.string().min(1, 'رقم الإصدار مطلوب'),
  changeSummary: z.string().min(1, 'ملخص التغييرات مطلوب'),
});

export type UploadRevisionFormValues = z.infer<typeof uploadRevisionSchema>;