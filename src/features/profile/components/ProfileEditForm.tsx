import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfileUpdate } from '../hooks/useProfileUpdate';
import { User, UserType, ProfileUpdateRequest } from '../../../types/profile';

/**
 * Schemat walidacji Zod - mirror server validation
 */
const profileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).nullable().optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  // Provider-specific
  business_name: z.string().max(255).optional(),
  service_description: z.string().max(2000).nullable().optional(),
  website_url: z.string().url().max(255).nullable().optional(),
  facebook_url: z.string().url().nullable().optional(),
  instagram_url: z.string().url().nullable().optional(),
}).refine((data) => {
  // Provider bio musi mieć ≥50 znaków
  if (data.bio && data.business_name) {
    return data.bio.length >= 50;
  }
  return true;
}, {
  message: 'Provider bio must be at least 50 characters',
  path: ['bio'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  user: User;
  onSuccess?: () => void;
}

/**
 * Formularz edycji profilu użytkownika
 * 
 * - React Hook Form + Zod validation
 * - Conditional fields dla provider
 * - Loading states i error display
 */
export function ProfileEditForm({ user, onSuccess }: ProfileEditFormProps) {
  const { mutate, isPending, error } = useProfileUpdate();
  const isProvider = user.user_type === UserType.Provider;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.profile?.bio || '',
      city: user.profile?.city || '',
      first_name: user.profile?.first_name || '',
      last_name: user.profile?.last_name || '',
      business_name: user.provider_profile?.business_name || '',
      service_description: user.provider_profile?.service_description || '',
      website_url: user.provider_profile?.website_url || '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === null ? undefined : value])
    ) as ProfileUpdateRequest;
    mutate(cleanData, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          {...register('bio')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder={isProvider ? 'Minimum 50 characters for providers' : ''}
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">City</label>
        <input
          type="text"
          {...register('city')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.city && (
          <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
        )}
      </div>

      {/* Provider-specific fields */}
      {isProvider && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              type="text"
              {...register('business_name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.business_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.business_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Description
            </label>
            <textarea
              {...register('service_description')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              type="url"
              {...register('website_url')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </>
      )}

      {/* API Error display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error.message}</p>
          {error.errors && (
            <ul className="mt-2 text-sm text-red-700">
              {Object.entries(error.errors).map(([field, messages]) => (
                <li key={field}>
                  {field}: {Array.isArray(messages) ? messages.join(', ') : String(messages)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
