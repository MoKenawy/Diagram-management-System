// src/components/login/LoginCard.tsx
import type { ReactNode } from 'react';

interface LoginCardProps {
  children: ReactNode;
}

export const LoginCard = ({ children }: LoginCardProps) => (
  <div dir="rtl" className="bg-surface text-on-surface min-h-screen flex items-center justify-center relative overflow-hidden bg-technical-pattern w-full">
    {/* Decorative Architectural Background Elements */}
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
      <div className="absolute top-0 right-0 w-full h-[1px] bg-outline-variant transform translate-y-32"></div>
      <div className="absolute top-0 right-32 w-[1px] h-full bg-outline-variant"></div>
      <div className="absolute bottom-32 right-0 w-full h-[1px] bg-outline-variant"></div>
      <div className="absolute top-0 left-32 w-[1px] h-full bg-outline-variant"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] border border-outline-variant border-opacity-30 rounded-xl"></div>
    </div>
    
    {/* Header / Language Toggle */}
    <header className="absolute top-0 w-full flex justify-between items-center p-6 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>architecture</span>
        </div>
        <span className="font-headline font-bold text-primary tracking-tight text-lg">مشروع ألفا</span>
      </div>
      <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors duration-200">
        <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>language</span>
        <span className="font-label text-sm font-medium">عربي / <span className="english">EN</span></span>
      </button>
    </header>

    <main className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row shadow-[0_40px_80px_rgba(17,28,45,0.08)] rounded-xl overflow-hidden bg-surface-container-lowest m-4">
      {/* Right Side (Visual) */}
      <div className="hidden lg:flex lg:w-5/12 bg-surface-container-high relative flex-col justify-between p-12 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30 mix-blend-multiply" 
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAZN1XRdssnZa5vKqSIHeaJOhGIbU4WCu3g51o3UdYibGFSSxAZ43pOWvMqBDv20OWWy7BxZDDv2zie2-po5wKXuqrGHVmG0Q-OebD3C7hqAi8L9UFVL8XPMz8a4ai737-G9OoH7QJJ4gtTQ9w4VA6pRVj8V2FIH0m-9WqlXeJQwNsiBKKA9BJO1Oytg01IdPSWoOxp91Cx3HL-A9TdB0gb1FeNQ835SKxabnoRsyn3wyg7aNQ8uejKxysXUzIop0jaX21OvF7wHc6s')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        ></div>
        <div className="relative z-10 space-y-4">
          <h1 className="font-headline font-extrabold text-4xl text-primary leading-tight tracking-tighter">
            أمين المخططات<span className="text-tertiary">.</span>
          </h1>
          <p className="font-body text-secondary text-sm max-w-xs leading-relaxed">
            نظام إدارة الأرشيف الهندسي. وصول دقيق إلى المخططات التقنية، التحكم في الإصدارات، والوثائق ثنائية اللغة.
          </p>
        </div>
        <div className="relative z-10 space-y-2 english text-left w-full flex flex-col items-start" dir="ltr">
          <h2 className="font-headline font-bold text-2xl text-primary leading-tight">
            Blueprint Curator
          </h2>
          <p className="font-body text-secondary text-xs max-w-[200px] leading-relaxed">
            Engineering Archive Management System. Precision in maintaining technical schematics and documents.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest relative">
        {children}
      </div>
    </main>
  </div>
);