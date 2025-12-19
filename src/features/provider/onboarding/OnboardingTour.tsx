import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Home,
  Calendar,
  MessageSquare,
  TrendingUp,
  User,
  Lightbulb,
  ChevronRight,
  Briefcase
} from 'lucide-react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  element: string; // CSS selector
  icon: any;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * OnboardingTour - interaktywny tour po aplikacji
 * 
 * Cechy:
 * - Highlight elementów z podświetleniem
 * - Pozycjonowanie tooltipów
 * - Progress indicator
 * - Skip/Back/Next controls
 * - Auto-scroll do elementów
 * - Backdrop blur
 */
export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);
    
    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
  }, [currentStep]);

  const updatePositions = () => {
    const element = document.querySelector(step.element);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setHighlightRect(rect);

    // Scroll to element if needed
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
    if (!isVisible) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Calculate tooltip position
    const tooltipWidth = 400;
    const tooltipHeight = 250;
    const padding = 20;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
    }

    // Keep tooltip in viewport
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = window.innerHeight - tooltipHeight - padding;
    }

    setTooltipPosition({ top, left });
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Highlight */}
      {highlightRect && (
        <>
          {/* Spotlight effect */}
          <div
            className="absolute bg-transparent border-4 border-cyan-500 rounded-xl animate-pulse"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            }}
          />
          {/* Pulse ring */}
          <div
            className="absolute border-2 border-cyan-400 rounded-xl animate-ping"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
            }}
          />
        </>
      )}

      {/* Tooltip */}
      <div
        className="absolute bg-white rounded-2xl shadow-2xl p-6 w-[400px] transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            <span className="text-xs font-bold text-gray-500 uppercase">
              Krok {currentStep + 1} z {steps.length}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          {step.title}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {step.description}
        </p>

        {/* Action */}
        {step.action && (
          <button
            onClick={step.action.onClick}
            className="w-full px-4 py-3 mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {step.action.label}
          </button>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors
              ${isFirstStep
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" />
            Wstecz
          </button>

          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Pomiń tour
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-bold hover:shadow-lg transition-shadow"
          >
            {isLastStep ? (
              <>
                <Check className="w-4 h-4" />
                Zakończ
              </>
            ) : (
              <>
                Dalej
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * OnboardingChecklist - checklist zadań do wykonania
 */
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  href: string;
  reward?: string;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  onItemComplete: (id: string) => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  items,
  onItemComplete,
}) => {
  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-600" />
            Pierwsze kroki
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Ukończono {completedCount} z {items.length} zadań
          </p>
        </div>
        <div className="text-3xl font-black text-gradient">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`
                block p-4 rounded-xl border-2 transition-all hover:shadow-md
                ${item.completed
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-cyan-300'
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox/Icon */}
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${item.completed
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                    : 'bg-gradient-to-br from-gray-300 to-gray-400'
                  }
                `}>
                  {item.completed ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold mb-1 ${
                    item.completed ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  {item.reward && !item.completed && (
                    <div className="mt-2 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-lg inline-flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs font-bold text-yellow-900">{item.reward}</span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className={`w-5 h-5 ${
                  item.completed ? 'text-green-600' : 'text-gray-400'
                }`} />
              </div>
            </a>
          );
        })}
      </div>

      {/* Completion reward */}
      {progress === 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-900">Gratulacje! 🎉</h3>
              <p className="text-sm text-green-700">Ukończyłeś wszystkie zadania onboardingowe. Twój Trust Score zwiększył się o <span className="font-bold">+20 punktów</span>!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Default steps for provider onboarding
export const PROVIDER_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Witaj w panelu providera! 👋',
    description: 'Pokażemy Ci najważniejsze funkcje, które pomogą Ci zarządzać Twoim biznesem. Ten tour potrwa tylko 2 minuty.',
    element: '.hero-gradient',
    icon: Home,
    position: 'bottom',
  },
  {
    id: 'dashboard',
    title: 'Twój dashboard',
    description: 'Tutaj znajdziesz najważniejsze statystyki i szybki dostęp do wszystkich funkcji. Dashboard aktualizuje się w czasie rzeczywistym.',
    element: '[data-tour="stats-cards"]',
    icon: TrendingUp,
    position: 'bottom',
  },
  {
    id: 'calendar',
    title: 'Kalendarz dostępności',
    description: 'Zarządzaj swoją dostępnością i akceptuj rezerwacje. Klienci widzą tylko wolne terminy.',
    element: '[href="/provider/calendar"]',
    icon: Calendar,
    position: 'right',
    action: {
      label: 'Otwórz kalendarz',
      onClick: () => window.location.href = '/provider/calendar',
    },
  },
  {
    id: 'messages',
    title: 'Wiadomości od klientów',
    description: 'Odpowiadaj na zapytania szybko, aby zwiększyć swój Trust Score. Średni czas odpowiedzi ma wpływ na ranking.',
    element: '[href="/provider/messages"]',
    icon: MessageSquare,
    position: 'right',
  },
  {
    id: 'marketing',
    title: 'Porady marketingowe',
    description: 'Otrzymuj spersonalizowane wskazówki, jak zwiększyć widoczność i pozyskać więcej klientów.',
    element: '[href="/provider/marketing"]',
    icon: Lightbulb,
    position: 'right',
  },
  {
    id: 'profile',
    title: 'Twój profil',
    description: 'Uzupełnij profil i dodaj portfolio. Kompletny profil z weryfikacją to +35 punktów do Trust Score!',
    element: '[href="/provider/profile"]',
    icon: User,
    position: 'right',
    action: {
      label: 'Edytuj profil',
      onClick: () => window.location.href = '/provider/profile',
    },
  },
];

export const PROVIDER_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'profile',
    title: 'Uzupełnij profil',
    description: 'Dodaj zdjęcie, opis i specjalizacje',
    icon: User,
    completed: false,
    href: '/provider/profile',
    reward: '+10 Trust Score',
  },
  {
    id: 'verification',
    title: 'Zweryfikuj tożsamość',
    description: 'Prześlij dokument tożsamości',
    icon: Check,
    completed: false,
    href: '/provider/profile?tab=verification',
    reward: '+15 Trust Score',
  },
  {
    id: 'portfolio',
    title: 'Dodaj portfolio',
    description: 'Prześlij 3-5 zdjęć swoich realizacji',
    icon: Sparkles,
    completed: false,
    href: '/provider/profile?tab=portfolio',
    reward: '+10 Trust Score',
  },
  {
    id: 'calendar',
    title: 'Ustaw dostępność',
    description: 'Dodaj pierwsze wolne terminy',
    icon: Calendar,
    completed: false,
    href: '/provider/calendar',
    reward: '+5 Trust Score',
  },
  {
    id: 'service',
    title: 'Dodaj pierwszą usługę',
    description: 'Stwórz ofertę dla klientów',
    icon: Briefcase,
    completed: false,
    href: '/provider/services',
    reward: '+10 Trust Score',
  },
];
