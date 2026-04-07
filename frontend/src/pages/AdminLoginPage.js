import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      toast.success('¡Bienvenido, Daniel!');
      navigate('/admin/dashboard');
    } catch (err) {
      const message = err.response?.data?.detail || 'Error al iniciar sesión';
      setError(typeof message === 'string' ? message : 'Credenciales inválidas');
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-[#262626] bg-[#141414] mb-6">
            <Terminal className="w-8 h-8 text-[#FF2A00]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Panel de Administración
          </h1>
          <p className="text-[#A3A3A3] text-sm">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#141414] border border-[#262626] p-8">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="admin-login-form">
            {error && (
              <div 
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                data-testid="login-error"
              >
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@email.com"
                className="bg-[#0A0A0A] border-[#262626] text-white placeholder:text-[#525252] focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none"
                data-testid="login-input-email"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-[#0A0A0A] border-[#262626] text-white placeholder:text-[#525252] focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none pr-12"
                  data-testid="login-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF2A00] hover:bg-[#CC2200] text-white font-medium py-6 rounded-none transition-colors"
              data-testid="login-submit-button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a 
            href="/"
            className="text-[#A3A3A3] hover:text-[#FF2A00] text-sm transition-colors"
          >
            ← Volver al sitio
          </a>
        </div>
      </div>
    </div>
  );
}
