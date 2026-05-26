'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin/useAdminAuth';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      router.push('/admin');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-wider text-gray-900">BELLALURE</h1>
            <p className="mt-2 text-sm text-gray-500">
              Connectez-vous au panneau d&apos;administration
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Mot de passe"
                className={`w-full rounded-lg border bg-white px-4 py-3 pr-12 text-sm outline-none transition-colors ${
                  error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-red-600">
                Mot de passe incorrect
              </motion.p>
            )}
            <button type="submit" className="mt-4 w-full rounded-lg bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800">
              Se connecter
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
