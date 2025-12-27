import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePasswordUpdate } from '../hooks/usePasswordUpdate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Schemat walidacji hasła
 */
const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  new_password_confirmation: z.string(),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: 'Passwords do not match',
  path: ['new_password_confirmation'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordChangeFormProps {
  onSuccess?: () => void;
}

/**
 * Formularz zmiany hasła
 * 
 * - Password strength indicator
 * - Confirmation match validation
 * - Show/hide password toggle
 */
export function PasswordChangeForm({ onSuccess }: PasswordChangeFormProps) {
  const [showPasswords, setShowPasswords] = useState(false);
  const { mutate, isPending, error, isSuccess } = usePasswordUpdate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = watch('new_password');

  const onSubmit = (data: PasswordFormData) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  // Password strength calculation
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password) && /[^a-zA-Z\d]/.test(password)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(newPassword);
  const strengthColor = 
    strength < 50 ? 'bg-red-500' :
    strength < 75 ? 'bg-yellow-500' :
    'bg-green-500';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isSuccess && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Password updated successfully!
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <Input
          type={showPasswords ? 'text' : 'password'}
          {...register('current_password')}
        />
        {errors.current_password && (
          <p className="mt-1 text-sm text-red-600">
            {errors.current_password.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <Input
          type={showPasswords ? 'text' : 'password'}
          {...register('new_password')}
        />
        {errors.new_password && (
          <p className="mt-1 text-sm text-red-600">
            {errors.new_password.message}
          </p>
        )}

        {/* Password strength indicator */}
        {newPassword && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Password strength</span>
              <span>{strength}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${strengthColor} h-2 rounded-full transition-all`}
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <Input
          type={showPasswords ? 'text' : 'password'}
          {...register('new_password_confirmation')}
        />
        {errors.new_password_confirmation && (
          <p className="mt-1 text-sm text-red-600">
            {errors.new_password_confirmation.message}
          </p>
        )}
      </div>

      {/* Show/hide passwords toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="show-passwords"
          checked={showPasswords}
          onChange={(e) => setShowPasswords(e.target.checked)}
          className="h-4 w-4 text-primary-600 rounded cursor-pointer"
        />
        <label htmlFor="show-passwords" className="ml-2 text-sm text-gray-700 cursor-pointer">
          Show passwords
        </label>
      </div>

      {/* API Error display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {error.status === 422
              ? 'Current password is incorrect'
              : error.message}
          </p>
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="md"
          disabled={isPending}
        >
          {isPending ? 'Updating...' : 'Change Password'}
        </Button>
      </div>
    </form>
  );
}
