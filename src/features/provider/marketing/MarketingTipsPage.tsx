import React from 'react';
import { TrendingUp, Target, Lightbulb, Zap, Users, Star, MessageSquare, Calendar } from 'lucide-react';

/**
 * Marketing Tips - Personalizowane porady marketingowe dla providerów
 * 
 * Features:
 * - Porady dostosowane do poziomu providera
 * - Kategorie: SEO, zaangażowanie, cennik, zdjęcia, opinie
 * - Tracking wykonanych porad
 * - Szacowany impact na widoczność
 */

type TipCategory = 'seo' | 'engagement' | 'pricing' | 'photos' | 'reviews' | 'availability';

type MarketingTip = {
  id: string;
  category: TipCategory;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  trustScoreBoost: number;
  completed: boolean;
};

const MOCK_TIPS: MarketingTip[] = [
  {
    id: '1',
    category: 'photos',
    title: 'Dodaj zdjęcia wykonanych prac',
    description: 'Profile z portfolio zdjęć otrzymują 3x więcej zapytań. Dodaj minimum 5 zdjęć swoich najlepszych realizacji.',
    impact: 'high',
    difficulty: 'easy',
    estimatedTime: '15 min',
    trustScoreBoost: 15,
    completed: false,
  },
  {
    id: '2',
    category: 'reviews',
    title: 'Poproś o opinię po ostatnim zleceniu',
    description: 'Masz 3 ukończone zlecenia bez opinii. Klienci z 5+ opiniami otrzymują 2x więcej rezerwacji.',
    impact: 'high',
    difficulty: 'easy',
    estimatedTime: '5 min',
    trustScoreBoost: 20,
    completed: false,
  },
  {
    id: '3',
    category: 'seo',
    title: 'Zoptymalizuj opis usług',
    description: 'Dodaj więcej szczegółów: jakie usługi dokładnie oferujesz, w jakim obszarze, jakie masz doświadczenie. Używaj słów kluczowych.',
    impact: 'medium',
    difficulty: 'medium',
    estimatedTime: '20 min',
    trustScoreBoost: 10,
    completed: false,
  },
  {
    id: '4',
    category: 'availability',
    title: 'Zwiększ dostępność o 20%',
    description: 'Obecnie masz 32h/tydzień. Providery z 40h+ dostępnością są 50% częściej rezerwowani.',
    impact: 'high',
    difficulty: 'easy',
    estimatedTime: '10 min',
    trustScoreBoost: 12,
    completed: false,
  },
  {
    id: '5',
    category: 'engagement',
    title: 'Odpowiedz na zapytania w <30 min',
    description: 'Szybki czas odpowiedzi to klucz do sukcesu. Aktywuj powiadomienia push i odpowiadaj błyskawicznie.',
    impact: 'high',
    difficulty: 'easy',
    estimatedTime: '2 min',
    trustScoreBoost: 8,
    completed: true,
  },
  {
    id: '6',
    category: 'pricing',
    title: 'Uzupełnij cennik',
    description: 'Profile z przejrzystym cennikiem otrzymują 40% więcej zapytań. Dodaj zakresy cenowe dla każdej usługi.',
    impact: 'medium',
    difficulty: 'medium',
    estimatedTime: '30 min',
    trustScoreBoost: 10,
    completed: false,
  },
];

const CATEGORY_ICONS: Record<TipCategory, React.ReactNode> = {
  seo: <TrendingUp className="w-5 h-5" />,
  engagement: <MessageSquare className="w-5 h-5" />,
  pricing: <Target className="w-5 h-5" />,
  photos: <Star className="w-5 h-5" />,
  reviews: <Users className="w-5 h-5" />,
  availability: <Calendar className="w-5 h-5" />,
};

const CATEGORY_LABELS: Record<TipCategory, string> = {
  seo: 'SEO',
  engagement: 'Zaangażowanie',
  pricing: 'Cennik',
  photos: 'Zdjęcia',
  reviews: 'Opinie',
  availability: 'Dostępność',
};

export const MarketingTipsPage: React.FC = () => {
  const completedCount = MOCK_TIPS.filter(t => t.completed).length;
  const totalBoost = MOCK_TIPS.filter(t => !t.completed).reduce((sum, t) => sum + t.trustScoreBoost, 0);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-emerald-600 bg-emerald-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-slate-600 bg-slate-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-cyan-600 bg-cyan-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Porady Marketingowe</h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalizowane wskazówki jak zwiększyć swoją widoczność i zdobyć więcej klientów
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <Lightbulb className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-bold text-slate-900">{MOCK_TIPS.length}</span>
          </div>
          <p className="text-sm text-slate-600">Dostępnych porad</p>
          <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / MOCK_TIPS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Wykonano {completedCount} z {MOCK_TIPS.length}
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <Zap className="w-8 h-8 text-cyan-500" />
            <span className="text-2xl font-bold text-gradient">+{totalBoost}</span>
          </div>
          <p className="text-sm text-slate-600">Potencjalny wzrost Trust Score</p>
          <p className="text-xs text-slate-500 mt-3">
            Zrealizuj wszystkie porady aby zwiększyć swoją widoczność
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-8 h-8 text-teal-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Twój cel</p>
              <p className="text-xs text-slate-600">3x więcej zapytań</p>
            </div>
          </div>
          <div className="text-xs text-slate-600">
            Wykonaj 5 porad wysokiego wpływu aby znacząco zwiększyć liczbę zapytań od klientów
          </div>
        </div>
      </div>

      {/* Tips List */}
      <div className="space-y-4">
        {MOCK_TIPS.map(tip => (
          <div
            key={tip.id}
            className={`glass-card p-6 rounded-2xl transition ${
              tip.completed ? 'opacity-60 bg-slate-50' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                tip.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-gradient-to-br from-cyan-100 to-teal-100 text-teal-600'
              }`}>
                {CATEGORY_ICONS[tip.category]}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900">{tip.title}</h3>
                      {tip.completed && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ✓ Wykonane
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{tip.description}</p>
                  </div>

                  {!tip.completed && (
                    <button className="ml-4 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg hover:from-cyan-600 hover:to-teal-600 transition shadow-lg flex-shrink-0">
                      Wykonaj
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-slate-500 uppercase font-medium">
                    {CATEGORY_LABELS[tip.category]}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getImpactColor(tip.impact)}`}>
                    {tip.impact === 'high' && '⚡ Wysoki wpływ'}
                    {tip.impact === 'medium' && '📊 Średni wpływ'}
                    {tip.impact === 'low' && '📈 Niski wpływ'}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(tip.difficulty)}`}>
                    {tip.difficulty === 'easy' && '😊 Łatwe'}
                    {tip.difficulty === 'medium' && '🤔 Średnie'}
                    {tip.difficulty === 'hard' && '💪 Trudne'}
                  </span>
                  <span className="text-xs text-slate-500">
                    ⏱️ {tip.estimatedTime}
                  </span>
                  <span className="text-xs font-semibold text-teal-600">
                    +{tip.trustScoreBoost} Trust Score
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="glass-card p-8 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 text-center">
        <Zap className="w-12 h-12 text-teal-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Zwiększ swoją widoczność już dziś!
        </h3>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto mb-6">
          Każda zrealizowana porada to krok w stronę więcej klientów. Zacznij od najłatwiejszych i obserwuj wyniki.
        </p>
        <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition shadow-lg">
          <Target className="w-5 h-5" />
          Zaplanuj akcję marketingową
        </button>
      </div>
    </div>
  );
};

export default MarketingTipsPage;
