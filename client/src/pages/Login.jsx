import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button, Card } from '../components/ui';
import { Logo } from '../components/Logo';
import { SiteFooter } from '../components/SiteFooter';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-7 flex justify-center">
            <Logo showTagline />
          </div>
          <Card className="border-0 bg-navy text-white shadow-xl">
            <h1 className="font-display text-xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-white/70">
              Login with your NexaCard account
            </p>
            <form onSubmit={onSubmit} className="mt-5 space-y-3.5">
              {error && <Alert>{error}</Alert>}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-white/80">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="you@company.com"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-white/80">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/30"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
              <Button type="submit" loading={loading} className="w-full">
                Login
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-white/70">
              No account?{' '}
              <Link to="/register" className="font-semibold text-white underline">
                Register now
              </Link>
            </p>
          </Card>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
