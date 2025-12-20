import React from 'react';
import { SubscriptionLimitsSection } from './widgets/SubscriptionLimitsSection';
import { PendingActionsWidget } from './widgets/PendingActionsWidget';
import { VerificationCompetenceWidget } from './widgets/VerificationCompetenceWidget';
import { RecentReviewsWidget } from './widgets/RecentReviewsWidget';
import { ReservationsCalendarCard } from './widgets/ReservationsCalendarCard';
import { NotificationsInboxCard } from './widgets/NotificationsInboxCard';
import { RecentActivity } from './widgets/RecentActivity';
import { ProfileCompletionCard } from './widgets/ProfileCompletionCard';
import { ServicesCard } from './widgets/ServicesCard';
import { TipsSidebar } from './widgets/TipsSidebar';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { PerformanceDashboardWidget } from './widgets/PerformanceDashboardWidget';
import { LiveActivityFeedWidget } from './widgets/LiveActivityFeedWidget';
import { useDashboardWidgets } from '../hooks/useDashboardWidgets';

/**
 * Main Grid Layout - interaktywny layout z nowymi widgetami
 * 
 * Layout 2/3 + 1/3:
 * - Lewa kolumna: Quick actions, Performance dashboard, limity planu, pending actions, rezerwacje, powiadomienia
 * - Prawa kolumna (sidebar): Live activity feed, profile completion, services, tips
 */
export const MainGrid: React.FC = () => {
  const { data: widgets, isLoading } = useDashboardWidgets();

  const reservations = widgets?.widgets?.reservations ?? [];
  const notifications = widgets?.widgets?.notifications ?? [];
  const services = widgets?.widgets?.services ?? [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 mt-12 md:mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          
          {/* Kolumna główna (2 kolumny) */}
          <div className="xl:col-span-2 space-y-4">
            {/* Quick Actions Widget */}
            <QuickActionsWidget />

            {/* Performance Dashboard Widget */}
            <PerformanceDashboardWidget />

            {/* Limity planu subskrypcji */}
            <SubscriptionLimitsSection />

            {/* Pending Actions Widget */}
            <PendingActionsWidget />
            
            {/* Verification Competence Widget */}
            <VerificationCompetenceWidget />
            
            {/* Recent Reviews Widget */}
            <RecentReviewsWidget />

            {/* Nadchodzące rezerwacje */}
            <ReservationsCalendarCard reservations={reservations} />

            {/* Powiadomienia */}
            <NotificationsInboxCard notifications={notifications} />
          </div>

          {/* Sidebar (1 kolumna) */}
          <div className="xl:col-span-1 space-y-4">
            {/* Live Activity Feed - NEW */}
            <LiveActivityFeedWidget />

            {/* Profile Completion */}
            <ProfileCompletionCard />

            {/* Services */}
            <ServicesCard services={services} />
            
            {/* Podpowiedzi */}
            <TipsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};
