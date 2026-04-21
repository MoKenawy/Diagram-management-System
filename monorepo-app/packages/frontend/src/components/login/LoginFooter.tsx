// src/components/login/LoginFooter.tsx
export const LoginFooter = () => (
  <>
    <div className="flex items-center justify-between pt-2">
      <a className="font-label text-xs font-medium text-primary hover:text-tertiary transition-colors border-b border-transparent hover:border-tertiary pb-0.5" href="#">
        استعادة الوصول
      </a>
      <a className="font-label text-xs font-medium text-primary hover:text-tertiary transition-colors border-b border-transparent hover:border-tertiary pb-0.5" href="#">
        تحتاج مساعدة؟
      </a>
    </div>

    <div className="mt-12 text-center text-[10px] font-label text-outline uppercase tracking-widest">
      بيئة آمنة • للموظفين المصرح لهم فقط
    </div>
  </>
);