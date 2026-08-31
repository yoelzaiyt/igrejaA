import React, { useEffect, useState } from 'react';
import AdminView from './AdminView';
import { getStoredBrands } from '../utils/brand';
import { playTapSound, playSuccessSound } from '../utils/audio';
import { speakText } from '../utils/tts';
import { supabase } from '../lib/supabase';
import { getAdminProfile, signInAdmin, signOutAdmin, requestPasswordReset, updateOwnPassword, AdminProfile } from '../lib/auth';

type AuthState = 'checking' | 'signed_out' | 'signed_in' | 'password_recovery';

export default function CentralAdminGate() {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const p = await getAdminProfile();
      if (!active) return;
      if (p) {
        setProfile(p);
        setAuthState('signed_in');
      } else {
        setAuthState('signed_out');
      }
    };

    void loadProfile();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthState('password_recovery');
        return;
      }
      if (session) {
        void loadProfile();
      } else {
        setProfile(null);
        setAuthState('signed_out');
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: signInError } = await signInAdmin(email.trim(), password);
    setSubmitting(false);
    if (signInError) {
      setError('E-mail ou senha inválidos.');
      return;
    }
    playSuccessSound();
    speakText('Acesso administrativo autorizado.', true);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Digite seu e-mail para receber o link de redefinição.');
      return;
    }
    setSubmitting(true);
    const { error: resetError } = await requestPasswordReset(email.trim());
    setSubmitting(false);
    if (resetError) {
      setError('Não foi possível enviar o e-mail de redefinição.');
      return;
    }
    playSuccessSound();
    setInfo('Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha.');
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A nova senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await updateOwnPassword(password);
    setSubmitting(false);
    if (updateError) {
      setError('Não foi possível atualizar a senha.');
      return;
    }
    playSuccessSound();
    speakText('Senha atualizada com sucesso.', true);
    setPassword('');
    const p = await getAdminProfile();
    if (p) {
      setProfile(p);
      setAuthState('signed_in');
    }
  };

  const handleLogout = async () => {
    playTapSound();
    await signOutAdmin();
  };

  if (authState === 'checking') {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-amber-500 animate-spin">progress_activity</span>
      </div>
    );
  }

  if (authState === 'signed_in' && profile) {
    const brands = getStoredBrands();
    const ownBrand = profile.role !== 'master' && profile.brandId ? brands[profile.brandId] : undefined;
    const initialBrand = ownBrand || Object.values(brands)[0];
    return <AdminView brand={initialBrand} lang="pt" onBack={handleLogout} profile={profile} />;
  }

  if (authState === 'password_recovery') {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-6 select-none">
        <form
          onSubmit={handleSetNewPassword}
          className="bg-slate-900 text-white rounded-3xl w-full max-w-sm shadow-2xl p-8 border border-white/10 text-center space-y-6"
        >
          <div className="space-y-2">
            <span className="material-symbols-outlined text-5xl text-amber-500">lock_reset</span>
            <h1 className="text-2xl font-black tracking-tight">Nova senha</h1>
            <p className="text-sm text-slate-400 font-medium">Defina a nova senha da sua conta</p>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs uppercase tracking-wider font-extrabold text-slate-400">Nova senha</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none focus:border-amber-500"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {error && <div className="text-red-400 text-sm font-semibold">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            onClick={() => playTapSound()}
            className="w-full h-12 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold uppercase tracking-widest rounded-xl transition-colors cursor-pointer text-sm"
          >
            {submitting ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-6 select-none">
      <form
        onSubmit={mode === 'login' ? handleLogin : handleForgotPassword}
        className="bg-slate-900 text-white rounded-3xl w-full max-w-sm shadow-2xl p-8 border border-white/10 text-center space-y-6"
      >
        <div className="space-y-2">
          <span className="material-symbols-outlined text-5xl text-amber-500">admin_panel_settings</span>
          <h1 className="text-2xl font-black tracking-tight">Central Administrativa</h1>
          <p className="text-sm text-slate-400 font-medium">
            {mode === 'login' ? 'Entre com sua conta de administrador' : 'Digite seu e-mail para redefinir a senha'}
          </p>
        </div>

        <div className="space-y-3 text-left">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-extrabold text-slate-400">E-mail</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none focus:border-amber-500"
              placeholder="voce@exemplo.com"
            />
          </div>
          {mode === 'login' && (
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-extrabold text-slate-400">Senha</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>
          )}
        </div>

        {error && <div className="text-red-400 text-sm font-semibold">{error}</div>}
        {info && <div className="text-emerald-400 text-sm font-semibold">{info}</div>}

        <button
          type="submit"
          disabled={submitting}
          onClick={() => playTapSound()}
          className="w-full h-12 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold uppercase tracking-widest rounded-xl transition-colors cursor-pointer text-sm"
        >
          {submitting ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Enviar link de redefinição'}
        </button>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            setError('');
            setInfo('');
            setMode(mode === 'login' ? 'forgot' : 'login');
          }}
          className="text-xs text-slate-400 hover:text-slate-200 font-semibold underline cursor-pointer"
        >
          {mode === 'login' ? 'Esqueci minha senha' : 'Voltar pro login'}
        </button>
      </form>
    </div>
  );
}
