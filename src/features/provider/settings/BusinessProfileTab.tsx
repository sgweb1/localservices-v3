import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBusiness, uploadLogo, type SettingsData } from '@/api/v1/settingsApi';
import { Button } from '@/components/ui/button';
import { SectionTitle, Text } from '@/components/ui/typography';
import { toast } from 'sonner';
import { Building2, Upload, X, Edit, Save, Camera, Link as LinkIcon, Globe } from 'lucide-react';

interface BusinessProfileTabProps {
  data?: SettingsData['business'];
}

export const BusinessProfileTab: React.FC<BusinessProfileTabProps> = ({ data }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(data?.logo || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    business_name: data?.name || '',
    short_description: data?.short_description || '',
    bio: data?.bio || '',
    website: data?.website || '',
    video_url: data?.video_url || '',
    social_media: {
      facebook: data?.social_media?.facebook || '',
      instagram: data?.social_media?.instagram || '',
      linkedin: data?.social_media?.linkedin || '',
      tiktok: data?.social_media?.tiktok || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateBusiness(formData),
    onSuccess: () => {
      toast.success('Profil biznesowy zaktualizowany');
      queryClient.invalidateQueries({ queryKey: ['provider', 'settings'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((err: any) => {
          toast.error(err);
        });
      } else {
        toast.error('Błąd aktualizacji profilu');
      }
    },
  });

  const logoMutation = useMutation({
    mutationFn: (file: File) => uploadLogo(file),
    onSuccess: (response) => {
      toast.success('Logo zaktualizowane');
      setLogoPreview(response.data.logo_url);
      queryClient.invalidateQueries({ queryKey: ['provider', 'settings'] });
    },
    onError: () => {
      toast.error('Błąd przesyłania logo');
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Plik musi być obrazem');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Plik nie może być większy niż 5MB');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = () => {
    if (logoFile) {
      logoMutation.mutate(logoFile);
      setLogoFile(null);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleCancel = () => {
    setFormData({
      business_name: data?.name || '',
      short_description: data?.short_description || '',
      bio: data?.bio || '',
      website: data?.website || '',
      video_url: data?.video_url || '',
      social_media: {
        facebook: data?.social_media?.facebook || '',
        instagram: data?.social_media?.instagram || '',
        linkedin: data?.social_media?.linkedin || '',
        tiktok: data?.social_media?.tiktok || '',
      },
    });
    setIsEditing(false);
    setLogoPreview(data?.logo || null);
    setLogoFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Section */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
            <Camera className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <SectionTitle>Logo firmy</SectionTitle>
            <Text size="sm" muted>Dodaj logo aby zwiększyć rozpoznawalność</Text>
          </div>
        </div>

        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600">
              {logoPreview ? (
                <>
                  <img 
                    src={logoPreview} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                Wybierz plik
              </Button>
              
              {logoFile && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleLogoUpload}
                  disabled={logoMutation.isPending}
                >
                  {logoMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Przesyłanie...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Zapisz logo
                    </>
                  )}
                </Button>
              )}
            </div>
            <Text size="sm" muted className="mt-2">
              JPG, PNG lub WEBP. Maksymalnie 5MB.
            </Text>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <SectionTitle>Informacje biznesowe</SectionTitle>
              <Text size="sm" muted>Podstawowe dane o Twojej firmie</Text>
            </div>
          </div>
          
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4" />
              Edytuj
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nazwa firmy *
            </label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
              minLength={2}
              maxLength={255}
              required
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Krótki opis <span className="text-slate-400">(max 120 znaków)</span>
            </label>
            <textarea
              value={formData.short_description}
              onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500 resize-none"
              rows={2}
              maxLength={120}
            />
            <Text size="sm" muted className="mt-1">
              {formData.short_description.length}/120 znaków
            </Text>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Opis szczegółowy <span className="text-slate-400">(max 1000 znaków)</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500 resize-none"
              rows={6}
              maxLength={1000}
            />
            <Text size="sm" muted className="mt-1">
              {formData.bio.length}/1000 znaków
            </Text>
          </div>
        </div>
      </div>

      {/* Online Presence */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <Globe className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <SectionTitle>Obecność online</SectionTitle>
            <Text size="sm" muted>Strona www i film promocyjny</Text>
          </div>
        </div>

        <div className="space-y-4">
          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Strona internetowa
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                disabled={!isEditing}
                placeholder="https://twoja-firma.pl"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
                maxLength={2048}
              />
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Film promocyjny (YouTube/Vimeo)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                disabled={!isEditing}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
                maxLength={2048}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
            <LinkIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <SectionTitle>Media społecznościowe</SectionTitle>
            <Text size="sm" muted>Linki do Twoich profili</Text>
          </div>
        </div>

        <div className="space-y-4">
          {/* Facebook */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Facebook
            </label>
            <input
              type="url"
              value={formData.social_media.facebook}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                social_media: { ...prev.social_media, facebook: e.target.value }
              }))}
              disabled={!isEditing}
              placeholder="https://facebook.com/twoja-firma"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
              maxLength={2048}
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Instagram
            </label>
            <input
              type="url"
              value={formData.social_media.instagram}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                social_media: { ...prev.social_media, instagram: e.target.value }
              }))}
              disabled={!isEditing}
              placeholder="https://instagram.com/twoja-firma"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
              maxLength={2048}
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={formData.social_media.linkedin}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                social_media: { ...prev.social_media, linkedin: e.target.value }
              }))}
              disabled={!isEditing}
              placeholder="https://linkedin.com/company/twoja-firma"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
              maxLength={2048}
            />
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              TikTok
            </label>
            <input
              type="url"
              value={formData.social_media.tiktok}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                social_media: { ...prev.social_media, tiktok: e.target.value }
              }))}
              disabled={!isEditing}
              placeholder="https://tiktok.com/@twoja-firma"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
              maxLength={2048}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateMutation.isPending}
          >
            <X className="w-5 h-5" />
            Anuluj
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Zapisz zmiany
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
};
