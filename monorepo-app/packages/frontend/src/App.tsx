import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center h-screen bg-slate-50">
              <div className="p-8 shadow-lg rounded-xl bg-white text-center space-y-4">
                <h1 className="text-4xl font-bold text-primary">Frontend App</h1>
                <p className="text-gray-500">React 19 + Tailwind CSS 4 + Vite 6</p>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}