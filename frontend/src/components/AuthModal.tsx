import React, { useState } from 'react';
import { Shield, Lock, User, Key, CheckCircle2, ArrowRight, Sparkles, Building, AlertCircle } from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  role: 'PRINCIPAL_SRE_COMMANDER' | 'INFRA_AUDITOR' | 'PLATFORM_OPERATOR';
  accountId: string;
  avatarUrl: string;
  sessionToken: string;
  mfaVerified: boolean;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser
}) => {
  const [email, setEmail] = useState('aaditya.uniyal@cloudsentinel.io');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState<'PRINCIPAL_SRE_COMMANDER' | 'INFRA_AUDITOR' | 'PLATFORM_OPERATOR'>('PRINCIPAL_SRE_COMMANDER');
  const [isLoading, setIsLoading] = useState(false);
  const [mfaCode, setMfaCode] = useState('849201');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user: UserProfile = {
        name: 'Aaditya Uniyal',
        email: email || 'aaditya.uniyal@cloudsentinel.io',
        role: role,
        accountId: '145023097151',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        sessionToken: `jwt_cs_live_${Date.now()}_prod_sec`,
        mfaVerified: true
      };

      onLoginSuccess(user);
      setIsLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-800 bg-slate-950/80 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-amber-700 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3 ring-1 ring-white/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">CloudSentinel Enterprise Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Single Sign-On & Multi-Factor Access Control</p>
        </div>

        {/* Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Enterprise Email
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-500 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Security Clearance Role
            </label>
            <select
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="PRINCIPAL_SRE_COMMANDER">Principal SRE Commander (Full Autonomous Control)</option>
              <option value="INFRA_AUDITOR">Infrastructure Compliance Auditor (Read & Audit)</option>
              <option value="PLATFORM_OPERATOR">Platform Operator (Triage & Diagnostics)</option>
            </select>
          </div>

          {/* MFA Token */}
          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-slate-200 block text-[11px]">Hardware MFA Token</span>
                <span className="text-[10px] text-emerald-400 font-mono">FIPS 140-3 Validated</span>
              </div>
            </div>
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-24 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono py-1 text-xs text-amber-300 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 transition active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating Session...' : 'Authenticate & Access SRE Command Grid'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-center text-[10px] text-slate-500 font-mono">
          Connected to Enterprise Directory (Account 145023097151)
        </div>
      </div>
    </div>
  );
};
