// src/components/login/SubmitButton.tsx
interface SubmitButtonProps {
  isLoading: boolean;
}

export const SubmitButton = ({ isLoading }: SubmitButtonProps) => (
  <button 
    className="w-full mt-8 bg-gradient-to-bl from-primary to-primary-container text-on-primary font-headline font-semibold py-3.5 rounded-md flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed" 
    type="submit"
    disabled={isLoading}
  >
    <span>{isLoading ? 'جاري التحقق...' : 'بدء الجلسة'}</span>
    {!isLoading && <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>arrow_back</span>}
  </button>
);