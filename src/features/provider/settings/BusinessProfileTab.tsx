import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBusiness, uploadLogo, deleteLogo, updateSubdomainSettings, type SettingsData } from '@/api/v1/settingsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SectionTitle, Text } from '@/components/ui/typography';
import { toast } from 'sonner';
import { Building2, Upload, X, Edit, Save, Camera, Link as LinkIcon, Globe, Sparkles, TrendingUp, CheckCircle2, AlertCircle, Share2 } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';

interface BusinessProfileTabProps {
  data?: SettingsData['business'];
}

export const BusinessProfileTab: React.FC<BusinessProfileTabProps> = ({ data }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm, ConfirmDialog } = useConfirm();
  
  const [logoPreview, setLogoPreview] = useState<string | null>(data?.logo || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(data?.subdomain ?? null);
  const [subdomainActive, setSubdomainActive] = useState<boolean>(Boolean(data?.subdomain_active && data?.subdomain));
  const [subdomainEnabled, setSubdomainEnabled] = useState<boolean>(Boolean(data?.subdomain_active && data?.subdomain));
  const [subdomainValue, setSubdomainValue] = useState<string>(data?.subdomain ?? '');
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [subdomainMessage, setSubdomainMessage] = useState<string | null>(null);
  const canUseSubdomain = Boolean(data?.can_use_subdomain);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [validationTouched, setValidationTouched] = useState<Record<string, boolean>>({});

  // Funkcja walidacji URL
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // opcjonalne
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Funkcja walidacji formularza
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.business_name.trim()) {
      errors.business_name = 'Nazwa firmy jest wymagana';
    } else if (formData.business_name.trim().length < 2) {
      errors.business_name = 'Nazwa musi mieć co najmniej 2 znaki';
    } else if (formData.business_name.length > 255) {
      errors.business_name = 'Nazwa może mieć maksymalnie 255 znaków';
    }

    if (formData.short_description && formData.short_description.length > 120) {
      errors.short_description = 'Opis krótki może mieć maksymalnie 120 znaków';
    }

    if (formData.bio && formData.bio.length > 1000) {
      errors.bio = 'Opis szczegółowy może mieć maksymalnie 1000 znaków';
    }

    if (formData.website && !validateUrl(formData.website)) {
      errors.website = 'Nieprawidłowy URL strony internetowej (np. https://twoja-firma.pl)';
    }

    if (formData.video_url && !validateUrl(formData.video_url)) {
      errors.video_url = 'Nieprawidłowy URL wideo (youtube.com lub vimeo.com)';
    }

    // Walidacja social media URLs
    if (formData.social_media.facebook && !validateUrl(formData.social_media.facebook)) {
      errors.facebook = 'Nieprawidłowy URL Facebook';
    }
    if (formData.social_media.instagram && !validateUrl(formData.social_media.instagram)) {
      errors.instagram = 'Nieprawidłowy URL Instagram';
    }
    if (formData.social_media.linkedin && !validateUrl(formData.social_media.linkedin)) {
      errors.linkedin = 'Nieprawidłowy URL LinkedIn';
    }
    if (formData.social_media.tiktok && !validateUrl(formData.social_media.tiktok)) {
      errors.tiktok = 'Nieprawidłowy URL TikTok';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Funkcja obsługująca zmianę pola formularza
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev };
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        (updated as any)[parent][child] = value;
      } else {
        (updated as any)[field] = value;
      }
      return updated;
    });
    // Wyczyść błąd dla tego pola
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleFieldBlur = (field: string) => {
    setValidationTouched(prev => ({ ...prev, [field]: true }));
  };

  const resolveBaseDomain = () => {
    const appUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin;
    try {
      return new URL(appUrl).host;
    } catch (e) {
      console.warn('Nieprawidłowy APP_URL/VITE_API_BASE_URL, fallback na ls.test', e);
      return 'ls.test';
    }
  };

  const subdomainBaseDomain = import.meta.env.VITE_SUBDOMAIN_BASE_DOMAIN || resolveBaseDomain();

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

  const deleteLogoMutation = useMutation({
    mutationFn: () => deleteLogo(),
    onSuccess: () => {
      toast.success('Logo usunięte');
      setLogoPreview(null);
      queryClient.invalidateQueries({ queryKey: ['provider', 'settings'] });
    },
    onError: () => {
      toast.error('Nie udało się usunąć logo');
    },
  });

  const subdomainMutation = useMutation({
    mutationFn: (payload: { enabled: boolean; subdomain?: string | null }) =>
      updateSubdomainSettings(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Subdomena została zapisana');

      const newSubdomain = (response.data?.subdomain as string | null) ?? null;
      const active = Boolean(response.data?.subdomain_active);

      setSubdomain(newSubdomain);
      setSubdomainActive(active);
      setSubdomainEnabled(active);
      setSubdomainValue(newSubdomain ?? '');
      setSubdomainError(null);
      setSubdomainMessage(response.message || 'Subdomena została zapisana');

      queryClient.invalidateQueries({ queryKey: ['provider', 'settings'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Błąd zapisu subdomeny';
      setSubdomainError(message);
      toast.error(message);
    },
  });

  // Obliczanie kompletności profilu
  const calculateProfileCompletion = (): number => {
    let score = 0;
    const maxScore = 10;
    
    if (formData.business_name?.trim()) score++;
    if (formData.short_description?.trim()) score++;
    if (formData.bio?.trim() && formData.bio.length >= 50) score++;
    if (logoPreview) score++;
    if (formData.website?.trim()) score++;
    if (formData.video_url?.trim()) score++;
    if (formData.social_media.facebook?.trim() || 
        formData.social_media.instagram?.trim() || 
        formData.social_media.linkedin?.trim() || 
        formData.social_media.tiktok?.trim()) score++;
    if (subdomainActive) score += 2;
    if (formData.bio?.trim() && formData.bio.length >= 100) score++;
    
    return Math.min(Math.round((score / maxScore) * 100), 100);
  };
  
  const completionScore = calculateProfileCompletion();
  const isProfileComplete = completionScore >= 80;

  // Komponent błędu pola
  const FieldError = ({ field }: { field: string }) => {
    const error = formErrors[field];
    const touched = validationTouched[field];
    
    if (!error || !touched) return null;
    
    return (
      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  };

  const validateSubdomainInput = (): string | null => {
    if (!subdomainEnabled) {
      return null;
    }

    const normalized = normalizeSubdomain(subdomainValue);

    if (normalized.length === 0) {
      return 'Podaj nazwę subdomeny';
    }

    if (!/^(?!-)[a-z0-9-]{3,50}(?<!-)$/.test(normalized)) {
      return '3-50 znaków, małe litery/cyfry/myślniki, bez myślnika na początku/końcu';
    }

    return null;
  };

  const handleSaveSubdomain = () => {
    if (!canUseSubdomain) {
      toast.error('Subdomena jest dostępna w planach Pro i Premium');
      return;
    }

    if (!subdomainEnabled) {
      subdomainMutation.mutate({ enabled: false });
      return;
    }

    const validationError = validateSubdomainInput();
    if (validationError) {
      setSubdomainError(validationError);
      toast.error(validationError);
      return;
    }

    setSubdomainError(null);
    setSubdomainMessage(null);

    subdomainMutation.mutate({
      enabled: true,
      subdomain: normalizeSubdomain(subdomainValue),
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('❌ Plik musi być obrazem (JPG, PNG lub WEBP)');
      return;
    }

    // Validate file size (5MB max)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      toast.error(`❌ Plik jest za duży (${fileSizeMB.toFixed(1)}MB). Maksymalnie 5MB.`);
      return;
    }

    // Validate image dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          toast.error('❌ Logo musi mieć co najmniej 100x100 pikseli');
          return;
        }
        setLogoFile(file);
        setLogoPreview(e.target?.result as string);
        toast.success('✅ Logo załadowane. Kliknij "Zapisz logo" aby potwierdzić');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = () => {
    if (logoFile) {
      toast.loading('⏳ Przesyłanie logo...');
      logoMutation.mutate(logoFile, {
        onSuccess: () => {
          setLogoFile(null);
          toast.success('✅ Logo zostało zmienione! Nowe logo jest już widoczne');
        },
        onError: (error: any) => {
          const errorMsg = error.response?.data?.message || 'Błąd przy przesyłaniu';
          toast.error(`❌ ${errorMsg}`);
        },
      });
    }
  };

  const handleRemoveLogo = async () => {
    // Jeśli użytkownik miał już zapisane logo – potwierdź i usuń na backendzie
    if (!logoFile && logoPreview) {
      const ok = await confirm({
        title: 'Potwierdzenie usunięcia',
        message: 'Czy na pewno chcesz usunąć logo?',
        confirmText: 'Usuń',
        variant: 'danger',
      });
      if (ok) {
        deleteLogoMutation.mutate();
      } else {
        return;
      }
    }

    // Wyczyść lokalny wybór pliku
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('❌ Popraw błędy w formularzu przed zapisaniem');
      return;
    }

    toast.loading('⏳ Zapisywanie zmian...');
    updateMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('✅ Profil biznesowy zaktualizowany pomyślnie!');
      },
      onError: (error: any) => {
        const serverErrors = error.response?.data?.errors;
        if (serverErrors) {
          Object.entries(serverErrors).forEach(([field, messages]: any) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            toast.error(`❌ ${field}: ${msg}`);
          });
        } else {
          toast.error('❌ Nie udało się zapisać profilu. Spróbuj ponownie.');
        }
      },
    });
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
    setLogoPreview(data?.logo || null);
    setLogoFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Completion Progress */}
      <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Kompletność profilu biznesowego</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">Pełny profil zwiększa widoczność i zaufanie klientów</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{completionScore}%</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Ukończono</p>
          </div>
        </div>
        
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionScore}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className={`flex items-center gap-1.5 ${formData.business_name?.trim() ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Nazwa</span>
          </div>
          <div className={`flex items-center gap-1.5 ${formData.short_description?.trim() ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Opis</span>
          </div>
          <div className={`flex items-center gap-1.5 ${logoPreview ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Logo</span>
          </div>
          <div className={`flex items-center gap-1.5 ${subdomainActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Subdomena</span>
          </div>
        </div>
        
        {!isProfileComplete && (
          <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700 dark:text-slate-200">
                <p className="font-semibold mb-1">💡 Porada marketingowa</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {completionScore < 30 && "Zacznij od nazwy firmy i krótkiego opisu. Zdecydowana większość klientów szuka usług dokładnie po słowach kluczowych w opisie."}
                  {completionScore >= 30 && completionScore < 60 && "Dodaj logo - firmy z logo mają o 45% więcej zapytań niż bez. To pierwszy element, na który patrzy klient."}
                  {completionScore >= 60 && completionScore < 80 && "Włącz subdomenę - unikalna domena zwiększa CTR o 30% i buduje profesjonalny wizerunek."}
                  {completionScore >= 80 && "Świetnie! Twój profil jest prawie kompletny. Dodaj film promocyjny - wideo zwiększa konwersję o aż 80%!"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Logo Section */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
            <Camera className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <SectionTitle>Logo firmy</SectionTitle>
            <Text size="sm" muted>Logo zwiększa zaufanie o 45% — usługi z logotypem otrzymują więcej zapytań</Text>
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
            <div className="flex flex-wrap items-center gap-2">
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
              JPG, PNG lub WEBP. Maksymalnie 5MB. Kwadratowe (200x200 lub więcej) wygląda najlepiej.
            </Text>
          </div>
        </div>
      </div>

      {/* Obecność online / Subdomena */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl">
              <Globe className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <SectionTitle>Obecność online</SectionTitle>
              <Text size="sm" muted>Subdomena (Do +30% CTR) + linki w wizytówce zaufania (video, strona, social media)</Text>
            </div>
          </div>

          {subdomainActive ? (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              Aktywna
            </span>
          ) : canUseSubdomain ? (
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              Wyłączona
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
              Wymaga Pro/Premium
            </span>
          )}
        </div>

        {subdomainActive ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
              <LinkIcon className="w-4 h-4 text-emerald-500" />
              <a
                href={`https://${subdomain}.${subdomainBaseDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 dark:text-cyan-300 hover:underline"
              >
                https://{subdomain}.{subdomainBaseDomain}
              </a>
            </div>
            <Text size="xs" muted>
              Krótki, wiarygodny adres zwiększa CTR i zaufanie klientów.
            </Text>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <p>
              Włącz własną subdomenę, aby mieć adres w formie
              <span className="font-semibold"> twoja-nazwa.{subdomainBaseDomain}</span>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>Większa rozpoznawalność w wynikach wyszukiwania</li>
              <li>Wyższe zaufanie dzięki spójnemu brandowi</li>
              <li>Łatwe udostępnianie w social media</li>
            </ul>
            {canUseSubdomain ? (
              <Text size="xs" muted>
                Masz dostęp w swoim planie — włącz i zapisz subdomenę poniżej.
              </Text>
            ) : (
              <Text size="xs" className="text-amber-700 dark:text-amber-400">
                Funkcja dostępna w planach Pro i Premium. Uaktualnij, aby ją odblokować.
              </Text>
            )}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Subdomena</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aktywuj i zapisz adres w ramach domeny {subdomainBaseDomain}</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={subdomainEnabled}
                disabled={!canUseSubdomain || subdomainMutation.isPending}
                onCheckedChange={(checked) => {
                  setSubdomainEnabled(checked);
                  setSubdomainError(null);
                  setSubdomainMessage(null);
                  if (!checked) {
                    setSubdomainValue(subdomain ?? '');
                  }
                }}
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{subdomainEnabled ? 'Włączona' : 'Wyłączona'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={subdomainValue}
                  onChange={(e) => setSubdomainValue(e.target.value)}
                  placeholder="twoja-nazwa"
                  disabled={!subdomainEnabled || !canUseSubdomain || subdomainMutation.isPending}
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">.{subdomainBaseDomain}</span>
              </div>
              <Button
                onClick={handleSaveSubdomain}
                disabled={!canUseSubdomain || subdomainMutation.isPending}
                variant="primary"
              >
                {subdomainMutation.isPending ? 'Zapisywanie...' : 'Zapisz subdomenę'}
              </Button>
            </div>
            {subdomainError && (
              <p className="text-xs text-red-600">{subdomainError}</p>
            )}
            {subdomainMessage && !subdomainError && (
              <p className="text-xs text-emerald-600">{subdomainMessage}</p>
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Wymagania: 3-50 znaków, małe litery/cyfry/myślniki, bez myślnika na początku/końcu. Subdomeny są unikalne w całym portalu.
        </div>

      </div>

      {/* Social Media & Links */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl">
            <Share2 className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <SectionTitle>Strona internetowa i media społeczne</SectionTitle>
            <Text size="sm" muted>Linki zwiększają zaufanie - klienci chcą poznać Twoją obecność online</Text>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">🌐 Strona internetowa</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Klienci szukają potwierdzenia - własna strona zwiększa konwersję o 25%</p>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleFieldChange('website', e.target.value)}
                onBlur={() => handleFieldBlur('website')}
                placeholder="https://twoja-firma.pl"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  validationTouched.website && formErrors.website
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-cyan-500'
                } focus:ring-2 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500`}
                maxLength={2048}
              />
            </div>
            <FieldError field="website" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">🎬 Film promocyjny (YouTube/Vimeo)</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Wideo zwiększa konwersję o 80% - pokaż swoje realizacje lub proces pracy</p>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => handleFieldChange('video_url', e.target.value)}
                onBlur={() => handleFieldBlur('video_url')}
                placeholder="https://youtube.com/watch?v=..."
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  validationTouched.video_url && formErrors.video_url
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-cyan-500'
                } focus:ring-2 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500`}
                maxLength={2048}
              />
            </div>
            <FieldError field="video_url" />
          </div>

          {/* Social Media */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">Socjalne</h4>
            
            {/* Facebook */}
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">facebook</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Facebookowe rekomendacje zwiększają zaufanie</p>
              <input
                type="url"
                value={formData.social_media.facebook}
                onChange={(e) => handleFieldChange('social_media.facebook', e.target.value)}
                onBlur={() => handleFieldBlur('facebook')}
                placeholder="https://facebook.com/twoja-firma"
                className={`w-full px-4 py-3 rounded-xl border ${
                  validationTouched.facebook && formErrors.facebook
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-cyan-500'
                } focus:ring-2 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500`}
                maxLength={2048}
              />
              <FieldError field="facebook" />
            </div>

            {/* Instagram */}
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">instagram</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Pokaż swoje prace - zdjęcia budują wiarygodność</p>
              <input
                type="url"
                value={formData.social_media.instagram}
                onChange={(e) => handleFieldChange('social_media.instagram', e.target.value)}
                onBlur={() => handleFieldBlur('instagram')}
                placeholder="https://instagram.com/twoja-firma"
                className={`w-full px-4 py-3 rounded-xl border ${
                  validationTouched.instagram && formErrors.instagram
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-cyan-500'
                } focus:ring-2 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500`}
                maxLength={2048}
              />
              <FieldError field="instagram" />
            </div>

            {/* LinkedIn */}
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">linkedin</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Profesjonalne doświadczenie - dla B2B niezbędne</p>
              <input
                type="url"
                value={formData.social_media.linkedin}
                onChange={(e) => handleFieldChange('social_media.linkedin', e.target.value)}
                onBlur={() => handleFieldBlur('linkedin')}
                placeholder="https://linkedin.com/company/twoja-firma"
                className={`w-full px-4 py-3 rounded-xl border ${
                  validationTouched.linkedin && formErrors.linkedin
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-cyan-500'
                } focus:ring-2 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500`}
                maxLength={2048}
              />
              <FieldError field="linkedin" />
            </div>

            {/* TikTok */}
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">tiktok</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Treści video dla młodszej grupy docelowej</p>
              <input
                type="url"
                value={formData.social_media.tiktok}
                onChange={(e) => handleFieldChange('social_media.tiktok', e.target.value)}
                onBlur={() => handleFieldBlur('tiktok')}
                placeholder="https://tiktok.com/@twoja-firma"
                className={`w-full px-4 py-3 rounded-xl border ${
                  validationTouched.tiktok && formErrors.tiktok
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-cyan-500'
                } focus:ring-2 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500`}
                maxLength={2048}
              />
              <FieldError field="tiktok" />
            </div>
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
              <Text size="sm" muted>Słowa kluczowe w opisie to 60% SEO - użyj nazw usług i lokalizacji</Text>
            </div>
          </div>
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
              onChange={(e) => handleFieldChange('business_name', e.target.value)}
              onBlur={() => handleFieldBlur('business_name')}
              className={`w-full px-4 py-3 rounded-xl border ${
                validationTouched.business_name && formErrors.business_name
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-cyan-500'
              } focus:ring-2 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500`}
              minLength={2}
              maxLength={255}
              required
            />
            <FieldError field="business_name" />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Krótki opis <span className="text-slate-400">(max 120 znaków)</span>
              <span className="block text-xs text-blue-600 dark:text-blue-400 font-normal mt-1">💡 Tip: Umieść główne słowa kluczowe (np. "hydraulika Warszawa doświadczony")</span>
            </label>
            <textarea
              value={formData.short_description}
              onChange={(e) => handleFieldChange('short_description', e.target.value)}
              onBlur={() => handleFieldBlur('short_description')}
              className={`w-full px-4 py-3 rounded-xl border ${
                validationTouched.short_description && formErrors.short_description
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-cyan-500'
              } focus:ring-2 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500 resize-none`}
              rows={2}
              maxLength={120}
            />
            <div className="flex items-center justify-between mt-1">
              <FieldError field="short_description" />
              <Text size="sm" muted className="text-right">{formData.short_description.length}/120 znaków</Text>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Opis szczegółowy <span className="text-slate-400">(max 1000 znaków)</span>
              <span className="block text-xs text-blue-600 dark:text-blue-400 font-normal mt-1">💡 Tip: Opisz doświadczenie, specjalizacje i unikalne cechy (co Cię wyróżnia?)</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              onBlur={() => handleFieldBlur('bio')}
              className={`w-full px-4 py-3 rounded-xl border ${
                validationTouched.bio && formErrors.bio
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-cyan-500'
              } focus:ring-2 focus:border-transparent bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-500 resize-none`}
              rows={6}
              maxLength={1000}
            />
            <div className="flex items-center justify-between mt-1">
              <FieldError field="bio" />
              <Text size="sm" muted className="text-right">{formData.bio.length}/1000 znaków</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
      {/* Dialog potwierdzenia */}
      {ConfirmDialog}
    </form>
  );
};
