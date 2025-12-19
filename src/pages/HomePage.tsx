import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Shield, Star, Wrench, Lightbulb, Sparkles, Heart, Leaf, Home, ArrowRight, Check, User, Briefcase, MapPin, MessageSquare } from 'lucide-react';
import { SearchBarWithData } from '../components/SearchBarWithData';
import { useCategories } from '../hooks/useCategories';

/**
 * HomePage Component - Strona główna z pełną funkcjonalnością
 * Hero, kategorie, how-it-works, pricing, features, CTA
 */
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [workflowMode, setWorkflowMode] = useState<'instant' | 'quote'>('instant');
  const { categories, loading: categoriesLoading } = useCategories();

  const stats = [
    { label: 'Zweryfikowani specjaliści', value: '2 400+', description: 'Poziomy weryfikacji 3-5' },
    { label: 'Średni Trust Score™', value: '82', description: 'Średnia wśród kont premium' },
    { label: 'Średni czas odpowiedzi', value: '12 min', description: 'W godzinach pracy' },
    { label: 'Miasta w zasięgu', value: '13', description: 'Główne aglomeracje w Polsce' },
  ];

  const iconMap = useMemo(
    () => ({
      'heroicon-o-wrench': Wrench,
      'heroicon-o-bolt': Zap,
      'heroicon-o-sparkles': Sparkles,
      'heroicon-o-heart': Heart,
      'heroicon-o-leaf': Leaf,
      'heroicon-o-home': Home,
      'heroicon-o-academic-cap': Lightbulb,
      'heroicon-o-star': Star,
    }),
    []
  );

  const resolveIcon = (icon?: string) => {
    if (icon && iconMap[icon as keyof typeof iconMap]) {
      return iconMap[icon as keyof typeof iconMap];
    }
    return Sparkles;
  };

  const handleCategoryClick = (slug: string) => {
    navigate(`/szukaj/${slug}`);
  };

  return (
    <div className="flex flex-col relative">
      {/* Animated dot pattern background - całe tło */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#80808020_1.5px,transparent_1.5px)] bg-[size:32px_32px] dark:bg-[radial-gradient(circle,#ffffff18_1.5px,transparent_1.5px)]"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-100 dark:bg-sky-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-100 dark:bg-sky-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-transparent overflow-hidden z-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start lg:items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-sky-700 dark:text-sky-300 tracking-wide">
                  2,847+ zweryfikowanych specjalistów
                </span>
              </div>

              {/* Hero Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                  Lokalne usługi na wyciągnięcie ręki
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                  Zweryfikowani fachowcy, natychmiastowe rezerwacje i pełna przejrzystość cen.
                </p>
              </div>

              {/* Advanced Search Bar with Autocomplete */}
              <div className="pt-4 space-y-4">
                <SearchBarWithData />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center">
                  Instant booking • Subskrypcje dla wykonawców • 70%+ Trust Score
                </p>
              </div>
            </div>

            {/* Right Stats Card */}
            <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-8 lg:p-10 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Zaufaj LocalServices
              </h2>
              <div className="space-y-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 mb-2">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-950/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Popularne kategorie
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Znajdź specjalistę w Twojej okolicy
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoriesLoading && (
              <div className="col-span-4 text-center text-gray-500 dark:text-gray-400 py-6">Ładuję kategorie...</div>
            )}
            {!categoriesLoading &&
              categories.slice(0, 8).map((category) => {
                const Icon = resolveIcon(category.icon ?? undefined);
                const count = category.providers_count ?? category.listings_count ?? 0;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-500 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-500/10 dark:to-sky-500/5 flex items-center justify-center group-hover:from-sky-100 group-hover:to-sky-200 dark:group-hover:from-sky-500/20 dark:group-hover:to-sky-500/10 transition-all">
                        <Icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-left mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                      {count ? `${count} specjalistów` : 'Dostępna kategoria'}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="jak-dziala" className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-3 mb-16 lg:mb-20">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white">
              Jak to działa
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              Rezerwujesz w minutę, monitorujesz na żywo, płacisz bezpiecznie.
            </p>
          </div>

          {/* Toggle Mode */}
          <div className="mt-8 flex items-center justify-center gap-3 mb-12">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-full p-1">
              <button
                onClick={() => setWorkflowMode('instant')}
                className={`px-5 py-2 rounded-full font-semibold transition-all text-sm ${
                  workflowMode === 'instant'
                    ? 'bg-sky-500 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Instant Booking
              </button>
              <button
                onClick={() => setWorkflowMode('quote')}
                className={`px-5 py-2 rounded-full font-semibold transition-all text-sm ${
                  workflowMode === 'quote'
                    ? 'bg-sky-500 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Zapytaj o wycenę
              </button>
            </div>
          </div>

          {/* Workflows */}
          <div className="grid gap-8 lg:gap-10 lg:grid-cols-2">
            {/* For Clients */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 p-8 lg:p-10 shadow-md hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Dla klientów</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Znajdź usługę, porównaj, zarezerwuj.</p>
                </div>
              </div>

              <div className="mb-4 flex justify-between items-center">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">Proces dla klientów</p>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-3 py-1 rounded-full">6 kroków</span>
              </div>

              <ol className="space-y-4">
                {[
                  { step: 1, title: 'Wybierz usługę i miasto', desc: 'Filtruj po kategorii, dostępne terminy.' },
                  { step: 2, title: 'Sprawdź Trust Score™ i weryfikacje', desc: '5 poziomów. Premium od 70%.' },
                  {
                    step: 3,
                    title: workflowMode === 'instant' ? 'Zarezerwuj od razu' : 'Poproś o wycenę',
                    desc: workflowMode === 'instant' ? 'Natychmiastowe potwierdzenie.' : 'Wykonawca potwierdzi termin i cenę.',
                  },
                  { step: 4, title: 'Potwierdź i płacisz bezpiecznie', desc: 'Pełna historia zamówienia.' },
                  { step: 5, title: 'Powiadomienia na żywo', desc: 'Statusy i czat (WebSocket).' },
                  { step: 6, title: 'Oceń usługę', desc: 'Twoja opinia wpływa na Trust Score™.' },
                ].map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 flex items-center justify-center text-white font-bold text-xs">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                      <p className="text-gray-600 dark:text-gray-300 text-xs">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6">
                <Link
                  to="/szukaj"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-5 py-2.5 font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                >
                  Znajdź usługę
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* For Specialists */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 p-8 lg:p-10 shadow-md hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Dla wykonawców</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Buduj profil, przejdź weryfikację, przyjmuj zlecenia.</p>
                </div>
              </div>

              <div className="mb-4 flex justify-between items-center">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">Proces dla specjalistów</p>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 rounded-full">6 kroków</span>
              </div>

              <ol className="space-y-4">
                {[
                  { step: 1, title: 'Załóż konto i profil', desc: 'Usługi, obszar działania, dostępność.' },
                  { step: 2, title: 'Przejdź weryfikację (5 poziomów)', desc: 'Wyższa weryfikacja = wyższy Trust Score™.' },
                  { step: 3, title: 'Dodaj usługi i terminy', desc: 'Instant Booking lub zapytania.' },
                  { step: 4, title: 'Otrzymuj rezerwacje', desc: 'Powiadomienia w czasie rzeczywistym.' },
                  { step: 5, title: 'Realizuj i aktualizuj status', desc: 'Aktualizacje widoczne od razu.' },
                  { step: 6, title: 'Zbieraj opinie — rośnij w rankingach', desc: 'Opinie + weryfikacje = lepsza pozycja.' },
                ].map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 flex items-center justify-center text-white font-bold text-xs">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                      <p className="text-gray-600 dark:text-gray-300 text-xs">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6">
                <Link
                  to="/rejestracja"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 px-5 py-2.5 font-semibold text-gray-900 dark:text-white text-sm transition-all"
                >
                  Dołącz jako specjalista
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: '5-poziomowa weryfikacja', desc: 'Więcej zaufania = więcej zleceń.' },
              { icon: Zap, title: 'Instant Booking', desc: 'Rezerwujesz w minutę, bez czekania.' },
              { icon: MessageSquare, title: 'Statusy na żywo', desc: 'Aktualizacje w czasie rzeczywistym.' },
              { icon: MapPin, title: 'Lokalny zasięg', desc: '13 miast i rozbudowane URL-e SEO.' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-5 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</p>
                      <p className="text-gray-600 dark:text-gray-300 text-xs">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-transparent">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16 lg:mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              Jasność i zaufanie w centrum LocalServices
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: 'Pełna weryfikacja', desc: '5 poziomów potwierdzania danych + Trust Score™.' },
              { icon: Zap, title: 'Instant Booking', desc: 'Rezerwujesz w minutę, bez długich ustaleń.' },
              { icon: MessageSquare, title: 'Statusy na żywo', desc: 'Aktualizacje i czat w czasie rzeczywistym (Reverb).' },
              { icon: MapPin, title: 'Lokalny zasięg', desc: '13 miast i rozbudowane SEO-friendly URL-e.' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 p-8 transition-all duration-300 hover:shadow-md hover:border-sky-500 dark:hover:border-sky-400 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-sky-500 dark:bg-sky-600 flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16 lg:mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4 leading-tight">
              Zacznij za darmo, potem odblokuj Premium
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Dla wykonawców: więcej widoczności, więcej leadów i pełny pakiet narzędzi do rozwoju.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 lg:gap-6 md:grid-cols-3 mb-16 lg:mb-20">
            {/* Yearly */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-8 lg:p-10 flex flex-col transition-all duration-300 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rocznie</h3>
                <div className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wide">
                  -40%
                </div>
              </div>
              <div className="mb-2">
                <span className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white">79</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2 font-semibold text-sm">zł/mies</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Płatność roczna z rabatem</p>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-8 flex-grow leading-relaxed">
                Dla firm, które chcą rosnąć najszybciej. Najlepszy deal roczny.
              </p>
              <button className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold py-3 hover:shadow-md hover:from-sky-600 hover:to-sky-700 transition-all duration-200 tracking-wide">
                <span>Wybieram plan</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Monthly (Recommended) */}
            <div className="md:scale-105 md:z-10 rounded-2xl border-2 border-sky-400 dark:border-sky-500 bg-white dark:bg-gray-950 p-8 lg:p-10 flex flex-col transition-all duration-300 hover:shadow-lg shadow-lg shadow-sky-200 dark:shadow-sky-500/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Miesięcznie</h3>
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 text-white text-xs font-bold uppercase tracking-wide">
                  Rekomendowany
                </div>
              </div>
              <div className="mb-2">
                <span className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white">129</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2 font-semibold text-sm">zł/mies</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Bez zobowiązań</p>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-8 flex-grow leading-relaxed">
                Elastycznie, anuluj w każdej chwili. Dostęp do wszystkiego.
              </p>
              <button className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold py-3 hover:shadow-md hover:from-sky-600 hover:to-sky-700 transition-all duration-200 tracking-wide">
                <span>Wybieram plan</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Free */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-8 lg:p-10 flex flex-col transition-all duration-300 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500/50">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Darmowy start</h3>
              <div className="mb-2">
                <span className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white">0</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2 font-semibold text-sm">zł</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Na zawsze darmowy</p>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-8 flex-grow leading-relaxed">
                Dodaj profil i pierwsze usługi. Upgrade gdy będziesz gotowy.
              </p>
              <Link
                to="/rejestracja"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl border-2 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-bold py-3 hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-md transition-all duration-200 tracking-wide"
              >
                <span>Dołącz gratis</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Pricing Features */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-gray-950 p-8 lg:p-10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Wszystkie plany zawierają:</h3>
            <div className="grid gap-6 sm:grid-cols-2 text-sm text-gray-700 dark:text-slate-300">
              {[
                'Trust Score™ i 5 poziomów weryfikacji',
                'Widoczność w katalogu usług i miast',
                'Rezerwacje i statusy na żywo (Reverb)',
                'Opinie i oceny po realizacji',
                'Powiadomienia dla klientów i specjalistów',
                'Zarządzanie harmonogramem i dostępnością',
                'Integracja płatności (Stripe)',
                'Analityka i raporty podstawowe',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Jesteś specjalistą?
          </h2>
          <p className="text-lg text-sky-100 mb-8 max-w-2xl mx-auto">
            Dołącz do LocalServices i zarabiaj na swoim terytorialnym doświadczeniu. 
            Zweryfikowani specjaliści to przychód bez koniec.
          </p>
          <Link
            to="/rejestracja"
            className="inline-block px-8 py-4 bg-white text-sky-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            Dołącz jako specjalista
          </Link>
        </div>
      </section>
    </div>
  );
};
