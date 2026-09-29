import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-9xl font-bold text-[#FF2A00] mb-4">404</h1>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Página no encontrada
          </h2>
          <p className="text-[#A3A3A3] text-lg mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#FF2A00] hover:bg-[#CC2200] text-white font-medium transition-all"
            >
              <Home className="w-5 h-5" />
              Ir al inicio
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-8 py-4 border border-[#262626] hover:border-[#FF2A00] text-white font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver atrás
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
