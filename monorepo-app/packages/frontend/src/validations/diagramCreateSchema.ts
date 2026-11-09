// src/validations/diagramCreateSchema.ts
import { z } from 'zod';

// Mirrors the formats the backend's extensionToFileFormat() recognises
// (see src/utils/storage.ts). DWG has no universally recognised MIME type,
// so validation is done by extension rather than by file.type.
export const ACCEPTED_FILE_EXTENSIONS = [
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.dwg',
] as const;

export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const hasAcceptedExtension = (fileName: string): boolean => {
  const dot = fileName.lastIndexOf('.');
  if (dot < 0) return false;
  const ext = fileName.slice(dot).toLowerCase();
  return (ACCEPTED_FILE_EXTENSIONS as readonly string[]).includes(ext);
};

export const createDiagramSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),

  description: z
    .string()
    .trim()
    .max(2000, 'Description must be at most 2000 characters'),

  departmentId: z.string().min(1, 'Department is required'),

  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(20, 'You can add at most 20 tags'),

  revisionLabel: z
    .string()
    .trim()
    .min(1, 'Revision label is required')
    .max(50, 'Revision label must be at most 50 characters'),

  changeSummary: z
    .string()
    .trim()
    .min(10, 'Change summary must be at least 10 characters')
    .max(2000, 'Change summary must be at most 2000 characters'),

  file: z
    .custom<File>((value) => value instanceof File, 'A diagram file is required')
    .refine((file) => file.size > 0, 'The selected file is empty')
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File must be smaller than ${MAX_FILE_SIZE_MB} MB`
    )
    .refine(
      (file) => hasAcceptedExtension(file.name),
      `Unsupported format. Allowed: ${ACCEPTED_FILE_EXTENSIONS.join(', ')}`
    ),
});

export type CreateDiagramFormValues = z.infer<typeof createDiagramSchema>;
export type CreateDiagramFormField = keyof CreateDiagramFormValues;
export type CreateDiagramFormErrors = Partial<Record<CreateDiagramFormField, string>>;

// Internal form state holds a File | null so the field can be empty before
// the user picks a file. The schema above (which requires a File) runs on submit.
export type CreateDiagramFormState = Omit<CreateDiagramFormValues, 'file'> & {
  file: File | null;
};
