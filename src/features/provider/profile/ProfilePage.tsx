import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Camera,
  ShieldCheck,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Edit2,
  Save,
  Plus,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { currentUser } from '../../../api/v1/authApi';
import {
  getCertifications,
  getPortfolio,
  getProviderVerifications,
  getServiceAreas,
  getTodayProviderMetrics,
  getTrustScore,
} from '../../../api/v1/providerProfileApi';
import { useProfileUpdate } from '../../profile/hooks/useProfileUpdate';
import { ProfileUpdateRequest, User as ProfileUser } from '../../../types/profile';
import {
  CertificationDto,
  PortfolioItemDto,
  ProviderTodayMetrics,
  ProviderVerificationStatus,
  ServiceAreaDto,
  TrustScoreResponse,
} from '../../../types/providerProfile';
import { toast } from 'sonner';

/**
 * Profile Management Page - zarządzanie profilem providera
 * 
 * Cechy:
 * - Edycja danych osobowych
 * - Status weryfikacji (5 poziomów)
 * - Portfolio zdjęć z upload
 * - Dokumenty weryfikacyjne
 * - Obszary działania
 * - Historia zmian
 */
export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'verification' | 'portfolio' | 'documents'>('basic');

  const { mutateAsync: saveProfile, isPending: isSaving } = useProfileUpdate();

  const { data: user, isLoading: isUserLoading } = useQuery<ProfileUser | null>({
    queryKey: ['auth', 'user'],
    queryFn: currentUser,
    staleTime: 60_000,
  });

  const providerId = user?.id;

  const { data: verificationData, isLoading: isVerificationLoading, error: verificationError } = useQuery<ProviderVerificationStatus>({
    queryKey: ['provider', 'verifications', providerId],
    queryFn: () => getProviderVerifications(providerId!),
    enabled: !!providerId,
  });

  const { data: trustScoreData, isLoading: isTrustScoreLoading, error: trustScoreError } = useQuery<TrustScoreResponse>({
    queryKey: ['provider', 'trust-score', providerId],
    queryFn: () => getTrustScore(providerId!),
    enabled: !!providerId,
  });

  const { data: portfolioData, isLoading: isPortfolioLoading, error: portfolioError } = useQuery<{ data: PortfolioItemDto[] }>({
    queryKey: ['provider', 'portfolio', providerId],
    queryFn: () => getPortfolio(providerId!, { per_page: 6 }).then((res) => ({ data: res.data })),
    enabled: !!providerId,
  });

  const { data: certificationsData, isLoading: isCertificationsLoading, error: certificationsError } = useQuery<{ data: CertificationDto[] }>({
    queryKey: ['provider', 'certifications', providerId],
    queryFn: () => getCertifications(providerId!, { per_page: 5 }).then((res) => ({ data: res.data })),
    enabled: !!providerId,
  });

  const { data: serviceAreasData, isLoading: isServiceAreasLoading, error: serviceAreasError } = useQuery<{ data: ServiceAreaDto[] }>({
    queryKey: ['provider', 'service-areas', providerId],
    queryFn: () => getServiceAreas(providerId!, { per_page: 10 }).then((res) => ({ data: res.data })),
    enabled: !!providerId,
  });

  const { data: todayMetrics, isLoading: isTodayMetricsLoading, error: todayMetricsError } = useQuery<ProviderTodayMetrics>({
    queryKey: ['provider', 'metrics', 'today', providerId],
    queryFn: () => getTodayProviderMetrics(providerId!),
    enabled: !!providerId,
  });

  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    business_name: '',
    service_description: '',
    website_url: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        city: user.city || '',
        business_name: user.provider_profile?.business_name || '',
        service_description: user.provider_profile?.service_description || '',
        website_url: user.provider_profile?.website_url || '',
      });
    }
  }, [user]);

  const verificationLevels = useMemo(() => {
    const hasPortfolio = (portfolioData?.data?.length || 0) > 0;

    return [
      {
        level: 1,
        name: 'Email',
        status: verificationData?.email ? 'completed' : 'pending',
        icon: Mail,
        date: null,
        description: 'Adres email',
      },
      {
        level: 2,
        name: 'Telefon',
        status: verificationData?.phone ? 'completed' : 'pending',
        icon: Phone,
        date: null,
        description: 'Numer telefonu',
      },
      {
        level: 3,
        name: 'Tożsamość',
        status: verificationData?.identity || user?.provider_profile?.verification_level === 3 ? 'completed' : 'pending',
        icon: User,
        date: null,
        description: 'Weryfikacja tożsamości',
      },
      {
        level: 4,
        name: 'Kwalifikacje',
        status: (certificationsData?.data || []).some((c) => c.is_verified) ? 'completed' : 'in_review',
        icon: Award,
        date: null,
        description: 'Certyfikaty branżowe',
      },
      {
        level: 5,
        name: 'Portfolio',
        status: hasPortfolio ? 'completed' : 'pending',
        icon: Briefcase,
        date: null,
        description: 'Publiczne portfolio',
      },
    ];
  }, [certificationsData?.data, portfolioData?.data, user?.provider_profile, verificationData]);

  const portfolioItems = portfolioData?.data || [];
  const documents = certificationsData?.data || [];

  const handleSave = async () => {
    // Walidacja bio dla providera
    if (user?.user_type === 'provider' && formData.bio && formData.bio.length < 50) {
      toast.error('Bio musi zawierać minimum 50 znaków dla providera');
      return;
    }

    try {
      const cleanPayload = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => value !== '' && value !== undefined)
      ) as ProfileUpdateRequest;

      await saveProfile(cleanPayload);
      setIsEditing(false);
      toast.success('Profil zapisany');
    } catch (error: any) {
      // Obsługa błędów walidacji z backendu (422)
      if (error?.status === 422 && error?.errors) {
        const fieldErrors = Object.entries(error.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join(' | ');
        toast.error(`Błędy walidacji: ${fieldErrors}`);
      } else {
        toast.error(error?.message || 'Nie udało się zapisać profilu');
      }
    }
  };

  const yearsExperience = user?.provider_profile?.years_experience ?? null;
  const verificationLevel = user?.provider_profile?.verification_level ?? 0;
  const trustScore = trustScoreData?.trust_score ?? user?.provider_profile?.trust_score ?? 0;
  const specializations = useMemo(() => {
    const description = user?.provider_profile?.service_description;
    if (!description) {
      return [] as string[];
    }
    return description
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);
  }, [user?.provider_profile?.service_description]);
  const serviceAreas = serviceAreasData?.data || [];
  const resolveCertificationStatus = (cert: CertificationDto) => {
    if (cert.is_verified) {
      return 'approved';
    }
    return cert.is_active ? 'in_review' : 'pending';
  };

  const pendingDocuments = documents.filter((doc) => resolveCertificationStatus(doc) !== 'approved').length;

  if (isUserLoading) {
    return <div className="p-6">Ładowanie profilu...</div>;
  }

  if (!user) {
    return <div className="p-6">Brak danych użytkownika. Zaloguj się, aby zarządzać profilem.</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
      case 'in_review':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress':
      case 'in_review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-red-100 text-red-700 border-red-300';
    }
  };

  const tabs = [
    { id: 'basic', label: 'Dane podstawowe', icon: User },
    { id: 'verification', label: 'Weryfikacja', icon: ShieldCheck, badge: `${verificationLevel}/5` },
    { id: 'portfolio', label: 'Portfolio', icon: Camera, badge: portfolioItems.length },
    { id: 'documents', label: 'Dokumenty', icon: FileText, badge: pendingDocuments || null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white/50 flex items-center justify-center overflow-hidden">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1.5">👤 {formData.name || user?.name || 'Profil providera'}</h1>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {formData.city || user?.city || 'Brak lokalizacji'}
                  </span>
                  {yearsExperience !== null && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {yearsExperience} lat doświadczenia
                    </span>
                  )}
                  <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-sm font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Poziom {verificationLevel}/5
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={isSaving}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                transition-all hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed
                ${isEditing 
                  ? 'bg-white text-cyan-600' 
                  : 'bg-white/20 backdrop-blur-md border-2 border-white/50 text-white'
                }
              `}
            >
              {isEditing ? (
                <>
                  <Save className="w-5 h-5" />
                  Zapisz zmiany
                </>
              ) : (
                <>
                  <Edit2 className="w-5 h-5" />
                  Edytuj profil
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap
                    ${isActive 
                      ? 'border-cyan-500 text-cyan-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {tab.badge && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold
                      ${isActive ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-700'}
                    `}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'basic' && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 border-b pb-3">📋 Dane podstawowe</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Imię i nazwisko
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Miasto
                      </label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      O mnie
                      {user?.user_type === 'provider' && isEditing && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({(formData.bio || '').length}/50 znaków min.)
                        </span>
                      )}
                    </label>
                    <textarea
                      value={formData.bio || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors disabled:bg-gray-50 resize-none ${
                        isEditing && user?.user_type === 'provider' && (formData.bio || '').length > 0 && (formData.bio || '').length < 50
                          ? 'border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                          : 'border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
                      }`}
                    />
                    {isEditing && user?.user_type === 'provider' && (formData.bio || '').length > 0 && (formData.bio || '').length < 50 && (
                      <p className="mt-1 text-xs text-orange-600">
                        Providery muszą podać minimum 50 znaków w bio.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Specjalizacje
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {specializations.length === 0 && (
                        <span className="text-sm text-gray-500">Brak specjalizacji — uzupełnij opis usług.</span>
                      )}
                      {specializations.map((spec, index) => (
                        <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Obszary działania
                    </label>
                    {isServiceAreasLoading && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Ładowanie obszarów...
                      </div>
                    )}
                    {serviceAreasError && (
                      <div className="text-sm text-red-600 mb-2">Nie udało się pobrać obszarów działania.</div>
                    )}
                    <div className="space-y-2">
                      {serviceAreas.length === 0 && !isServiceAreasLoading && !serviceAreasError && (
                        <div className="text-sm text-gray-500">Brak zdefiniowanych obszarów działania.</div>
                      )}
                      {serviceAreas.map((area) => (
                        <div key={area.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <MapPin className="w-4 h-4 text-cyan-600" />
                          <div className="flex-1">
                            <span className="block text-sm font-medium">{area.name}</span>
                            <span className="text-xs text-gray-500">
                              Zasięg: {area.radius_km ?? 'n/d'} km
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            {area.is_active ? 'Aktywny' : 'Wyłączony'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-4">
                {isVerificationLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ładowanie statusów weryfikacji...
                  </div>
                )}
                {verificationError && (
                  <div className="text-sm text-red-600">Nie udało się pobrać danych weryfikacji.</div>
                )}
                {verificationLevels.map((level) => {
                  const Icon = level.icon;
                  const isCompleted = level.status === 'completed';
                  const isInProgress = level.status === 'in_progress';
                  
                  return (
                    <div
                      key={level.level}
                      className={`
                        glass-card rounded-2xl p-6 transition-all
                        ${isCompleted ? 'border-2 border-green-300' : ''}
                        ${isInProgress ? 'border-2 border-yellow-300' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center
                            ${isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-gray-300 to-gray-400'}
                          `}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Poziom {level.level}: {level.name}
                              </h3>
                              {getStatusIcon(level.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                            {level.date && (
                              <p className="text-xs text-gray-500">
                                Zweryfikowano: {new Date(level.date).toLocaleDateString('pl-PL')}
                              </p>
                            )}
                          </div>
                        </div>
                        {!isCompleted && (
                          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-shadow">
                            {isInProgress ? 'Sprawdź status' : 'Rozpocznij'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Trust Score Impact */}
                <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        ✨ Zwiększ swój Trust Score™
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Ukończenie wszystkich poziomów weryfikacji zwiększy Twój Trust Score o <span className="font-bold text-cyan-600">+35 punktów</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
                            style={{ width: `${Math.min((verificationLevel / 5) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{verificationLevel}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📷 Portfolio</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pokaż swoje najlepsze realizacje</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-shadow">
                    <Upload className="w-4 h-4" />
                    Dodaj zdjęcie
                  </button>
                </div>

                {isPortfolioLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ładowanie portfolio...
                  </div>
                )}
                {portfolioError && (
                  <div className="mb-4 text-sm text-red-600">Nie udało się pobrać portfolio.</div>
                )}
                {portfolioItems.length === 0 && !isPortfolioLoading && !portfolioError ? (
                  <div className="p-4 border border-dashed border-gray-300 rounded-xl text-sm text-gray-600">
                    Brak elementów w portfolio.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
                        <img
                          src={item.thumbnail_path || item.image_paths?.[0] || ''}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10"></div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm font-semibold">{item.title}</p>
                          <div className="flex items-center gap-1 mt-1 text-white text-xs">
                            <Award className="w-3 h-3" />
                            {item.likes} polubień
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-cyan-100 flex items-center justify-center transition-colors">
                        <Plus className="w-6 h-6 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 group-hover:text-cyan-600 transition-colors">
                        Dodaj zdjęcie
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📄 Dokumenty</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Przesyłaj dokumenty do weryfikacji</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-shadow">
                    <Upload className="w-4 h-4" />
                    Dodaj dokument
                  </button>
                </div>

                {isCertificationsLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ładowanie dokumentów...
                  </div>
                )}
                {certificationsError && (
                  <div className="mb-4 text-sm text-red-600">Nie udało się pobrać dokumentów.</div>
                )}
                {documents.length === 0 && !isCertificationsLoading && !certificationsError ? (
                  <div className="p-4 border border-dashed border-gray-300 rounded-xl text-sm text-gray-600">
                    Brak dokumentów.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(resolveCertificationStatus(doc))}`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{doc.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-600">{doc.issuer || 'Certyfikat'}</span>
                            {doc.issue_date && (
                              <span className="text-xs text-gray-500">
                                Wydano: {new Date(doc.issue_date).toLocaleDateString('pl-PL')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(resolveCertificationStatus(doc))}
                          {resolveCertificationStatus(doc) === 'approved' && doc.credential_url && (
                            <a
                              href={doc.credential_url}
                              className="text-cyan-600 hover:text-cyan-700"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-gray-900">Brakujące dokumenty</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {pendingDocuments > 0
                            ? `Masz ${pendingDocuments} dokumentów do weryfikacji.`
                            : 'Wszystkie dokumenty są zweryfikowane.'}
                        </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trust Score Card */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-600" />
                Trust Score™
              </h3>
              <div className="text-center mb-4">
                {isTrustScoreLoading ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gradient mb-2">{trustScore}</div>
                    <p className="text-sm text-gray-600">Poziom weryfikacji: {verificationLevel}/5</p>
                  </>
                )}
                {trustScoreError && (
                  <p className="text-xs text-red-600 mt-2">Nie udało się pobrać Trust Score.</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Email</span>
                  {getStatusIcon(verificationData?.email ? 'completed' : 'pending')}
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Telefon</span>
                  {getStatusIcon(verificationData?.phone ? 'completed' : 'pending')}
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Tożsamość</span>
                  {getStatusIcon(verificationData?.identity ? 'completed' : 'pending')}
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Certyfikaty</span>
                  {getStatusIcon((documents || []).some((d) => d.is_verified) ? 'approved' : 'in_review')}
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Portfolio</span>
                  {getStatusIcon(portfolioItems.length > 0 ? 'completed' : 'pending')}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 Statystyki profilu</h3>
              {isTodayMetricsLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ładowanie metryk...
                </div>
              )}
              {todayMetricsError && (
                <div className="text-sm text-red-600 mb-3">Nie udało się pobrać metryk dziennych.</div>
              )}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ukończone zlecenia</span>
                  <span className="text-base font-bold text-gradient">{todayMetrics?.bookings_completed ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Anulacje</span>
                  <span className="text-base font-bold text-gradient">{todayMetrics?.bookings_cancelled ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Portfolio</span>
                  <span className="text-base font-bold text-gradient">{portfolioItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Średnia ocena</span>
                  <span className="text-base font-bold text-gradient">{(todayMetrics?.avg_rating ?? 0).toFixed(1)} ⭐</span>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-200">
              <h3 className="text-base font-semibold text-gray-900 mb-2">💬 Potrzebujesz pomocy?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Nasz zespół pomoże Ci ukończyć weryfikację
              </p>
              <a
                href="/provider/support"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-bold hover:shadow-lg transition-shadow"
              >
                Skontaktuj się
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
