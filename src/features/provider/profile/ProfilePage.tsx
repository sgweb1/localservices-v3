import React, { useState } from 'react';
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
  X,
  Plus,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

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

  // Mock data
  const [profile, setProfile] = useState({
    name: 'Jan Kowalski',
    email: 'jan.kowalski@example.com',
    phone: '+48 123 456 789',
    city: 'Warszawa',
    district: 'Śródmieście',
    address: 'ul. Marszałkowska 1, 00-001 Warszawa',
    bio: 'Doświadczony hydraulik z 15-letnim stażem. Specjalizuję się w naprawach awaryjnych i instalacjach.',
    specializations: ['Hydraulika', 'Instalacje wodne', 'Kanalizacja'],
    yearsOfExperience: 15,
    serviceAreas: ['Warszawa - Śródmieście', 'Warszawa - Mokotów', 'Warszawa - Żoliborz'],
  });

  const verificationLevels = [
    {
      level: 1,
      name: 'Email',
      status: 'completed',
      icon: Mail,
      date: '2024-01-15',
      description: 'Adres email zweryfikowany',
    },
    {
      level: 2,
      name: 'Telefon',
      status: 'completed',
      icon: Phone,
      date: '2024-01-15',
      description: 'Numer telefonu potwierdzony',
    },
    {
      level: 3,
      name: 'Tożsamość',
      status: 'completed',
      icon: User,
      date: '2024-01-20',
      description: 'Dowód osobisty zweryfikowany',
    },
    {
      level: 4,
      name: 'Kwalifikacje',
      status: 'in_progress',
      icon: Award,
      date: null,
      description: 'Certyfikaty branżowe w weryfikacji',
    },
    {
      level: 5,
      name: 'Firma',
      status: 'pending',
      icon: Briefcase,
      date: null,
      description: 'Dokumenty firmy nie przesłane',
    },
  ];

  const portfolioItems = [
    { id: 1, url: '/placeholder1.jpg', title: 'Instalacja centralnego ogrzewania', likes: 24 },
    { id: 2, url: '/placeholder2.jpg', title: 'Remont łazienki', likes: 18 },
    { id: 3, url: '/placeholder3.jpg', title: 'Montaż bojlera', likes: 32 },
    { id: 4, url: '/placeholder4.jpg', title: 'Wymiana rur', likes: 15 },
  ];

  const documents = [
    { id: 1, name: 'Dowód osobisty', type: 'ID', status: 'approved', uploadDate: '2024-01-15' },
    { id: 2, name: 'Certyfikat hydrauliczny', type: 'Certificate', status: 'in_review', uploadDate: '2024-02-01' },
    { id: 3, name: 'Ubezpieczenie OC', type: 'Insurance', status: 'pending', uploadDate: null },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // TODO: API call to save profile
  };

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
    { id: 'verification', label: 'Weryfikacja', icon: ShieldCheck, badge: '3/5' },
    { id: 'portfolio', label: 'Portfolio', icon: Camera, badge: portfolioItems.length },
    { id: 'documents', label: 'Dokumenty', icon: FileText, badge: documents.filter(d => d.status === 'pending').length || null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white/50 flex items-center justify-center overflow-hidden">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black mb-2">{profile.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {profile.yearsOfExperience} lat doświadczenia
                  </span>
                  <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Poziom 3/5
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold
                transition-all hover:scale-105 hover:shadow-xl
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">Dane podstawowe</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Imię i nazwisko
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Miasto
                      </label>
                      <input
                        type="text"
                        value={profile.city}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      O mnie
                    </label>
                    <textarea
                      value={profile.bio}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors disabled:bg-gray-50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Specjalizacje
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profile.specializations.map((spec, index) => (
                        <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                          {spec}
                          {isEditing && (
                            <button className="hover:text-red-600 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                      {isEditing && (
                        <button className="px-3 py-1.5 border-2 border-dashed border-cyan-300 text-cyan-600 rounded-lg text-sm font-semibold hover:bg-cyan-50 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Obszary działania
                    </label>
                    <div className="space-y-2">
                      {profile.serviceAreas.map((area, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                          <MapPin className="w-4 h-4 text-cyan-600" />
                          <span className="flex-1 text-sm font-medium">{area}</span>
                          {isEditing && (
                            <button className="text-red-600 hover:text-red-700 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" />
                          Dodaj obszar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-4">
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
                              <h3 className="text-lg font-bold text-gray-900">
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
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Zwiększ swój Trust Score™
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Ukończenie wszystkich poziomów weryfikacji zwiększy Twój Trust Score o <span className="font-bold text-cyan-600">+35 punktów</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">3/5</span>
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
                    <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
                    <p className="text-sm text-gray-600 mt-1">Pokaż swoje najlepsze realizacje</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-shadow">
                    <Upload className="w-4 h-4" />
                    Dodaj zdjęcie
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/20"></div>
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
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Dokumenty</h2>
                    <p className="text-sm text-gray-600 mt-1">Przesyłaj dokumenty do weryfikacji</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-shadow">
                    <Upload className="w-4 h-4" />
                    Dodaj dokument
                  </button>
                </div>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(doc.status)}`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{doc.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-600">{doc.type}</span>
                          {doc.uploadDate && (
                            <span className="text-xs text-gray-500">
                              Przesłano: {new Date(doc.uploadDate).toLocaleDateString('pl-PL')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        {doc.status === 'approved' && (
                          <button className="text-cyan-600 hover:text-cyan-700">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Brakujące dokumenty</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Prześlij ubezpieczenie OC, aby odblokować Poziom 5 weryfikacji
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
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-600" />
                Trust Score™
              </h3>
              <div className="text-center mb-4">
                <div className="text-5xl font-black text-gradient mb-2">73</div>
                <p className="text-sm text-gray-600">Poziom weryfikacji: 3/5</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email</span>
                  <span className="font-bold text-green-600">+10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Telefon</span>
                  <span className="font-bold text-green-600">+10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tożsamość</span>
                  <span className="font-bold text-green-600">+15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Opinie klientów</span>
                  <span className="font-bold text-green-600">+28</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Portfolio</span>
                  <span className="font-bold text-green-600">+10</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statystyki profilu</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wyświetlenia</span>
                  <span className="text-lg font-bold text-gradient">2,543</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Portfolio</span>
                  <span className="text-lg font-bold text-gradient">{portfolioItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Opinie</span>
                  <span className="text-lg font-bold text-gradient">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Średnia ocena</span>
                  <span className="text-lg font-bold text-gradient">4.8 ⭐</span>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Potrzebujesz pomocy?</h3>
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
