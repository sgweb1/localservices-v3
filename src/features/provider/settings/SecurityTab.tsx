import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updatePassword } from '@/api/v1/settingsApi';
import { Button } from '@/components/ui/button';
import { SectionTitle, Text } from '@/components/ui/typography';
import { toast } from 'sonner';
import { Shield, Lock, Key, CheckCircle, AlertCircle } from 'lucide-react';

interface SecurityTabProps {
  data?: {
    two_factor_enabled: boolean;
    email: string;
    email_verified: boolean;
  };
}

export const SecurityTab: React.FC<SecurityTabProps> = ({ data }) => {
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const mutation = useMutation({
    mutationFn: () => updatePassword(passwordForm),
    onSuccess: () => {
      toast.success('Hasło zostało zmienione');
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Błąd zmiany hasła';
      const errors = error.response?.data?.errors;
      
      if (errors) {
        Object.values(errors).flat().forEach((err: any) => {
          toast.error(err);
        });
      } else {
        toast.error(message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error('Nowe hasło i potwierdzenie nie są takie same');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast.error('Hasło musi mieć co najmniej 8 znaków');
      return;
    }

    mutation.mutate();
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Słabe', color: 'bg-red-500' };
    if (password.length < 10) return { strength: 50, label: 'Średnie', color: 'bg-yellow-500' };
    if (password.length < 14) return { strength: 75, label: 'Dobre', color: 'bg-blue-500' };
    return { strength: 100, label: 'Silne', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.new_password);

  return (
    <div className="space-y-6">
      {/* Email Verification Status */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <SectionTitle>Status bezpieczeństwa</SectionTitle>
            <Text size="sm" muted>Informacje o zabezpieczeniu konta</Text>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-full ${data?.email_verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                {data?.email_verified ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
              </div>
              <div>
                <Text className="font-medium">Email</Text>
                <Text size="sm" muted>{data?.email}</Text>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              data?.email_verified 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {data?.email_verified ? 'Zweryfikowany' : 'Niezweryfikowany'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-full ${data?.two_factor_enabled ? 'bg-green-100' : 'bg-slate-200'}`}>
                <Lock className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <Text className="font-medium">Uwierzytelnianie dwuskładnikowe (2FA)</Text>
                <Text size="sm" muted>Dodatkowa warstwa zabezpieczeń</Text>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              data?.two_factor_enabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {data?.two_factor_enabled ? 'Włączone' : 'Wyłączone'}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <Key className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <SectionTitle>Zmiana hasła</SectionTitle>
            <Text size="sm" muted>Zaktualizuj hasło dostępu do konta</Text>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Obecne hasło *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.current ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nowe hasło *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.new ? '🙈' : '👁️'}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {passwordForm.new_password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                  <Text size="sm" className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                    {passwordStrength.label}
                  </Text>
                </div>
                <Text size="sm" muted>Minimum 8 znaków</Text>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Potwierdź nowe hasło *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.new_password_confirmation}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.confirm ? '🙈' : '👁️'}
              </button>
            </div>
            {passwordForm.new_password_confirmation && 
             passwordForm.new_password !== passwordForm.new_password_confirmation && (
              <Text size="sm" className="text-red-500 mt-1">
                Hasła nie są identyczne
              </Text>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              variant="primary"
              size="lg"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Zmieniam hasło...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Zmień hasło
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
