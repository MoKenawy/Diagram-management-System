import { z } from 'zod';
import { Role } from '@/types/index';

export const userFormSchema = z.object({
  username: z.string().min(3, { message: 'اسم المستخدم يجب أن يكون 3 حروف على الأقل' }),
  fullName: z.string().min(3, { message: 'الاسم الكامل مطلوب' }),
  email: z.string().email({ message: 'بريد إلكتروني غير صالح' }).optional().or(z.literal('')),
  role: z.nativeEnum(Role, { message: 'الدور مطلوب' }),
  departmentId: z.string().optional(),
  password: z.string().optional(),
});