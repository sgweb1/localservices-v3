import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Check, Crown, Zap, TrendingUp, AlertCircle, Sparkles, Gift } from 'lucide-react';
import { PageTitle, Text, SectionTitle, Caption, StatValue, EmptyText } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Link } from 'react-router-dom';

/**
 * Subscription Management Page
 * 
 * Zarządzanie subskrypcją i planem providera
 * MVP: Wyłączono płatne funkcje
 * 
 * @component
 * @returns {React.ReactElement} Subscription dashboard
 */
export const SubscriptionPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <PageTitle gradient>Subskrypcje wyłączone w MVP</PageTitle>
        <Text muted size="sm" className="mt-2">
          Płatne plany, boosty i płatności online są wyłączone na czas wersji MVP. Skupiamy się na rezerwacjach, wiadomościach
          oraz powiadomieniach email/chat.
        </Text>
      </div>

      <Card className="p-6 space-y-4">
        <Text size="sm">
          Jeżeli szukasz ustawień konta lub powiadomień, przejdź do ustawień providera. Kanały push/SMS i płatne widoczności są
          wstrzymane do kolejnej fazy.
        </Text>
        <div className="flex flex-wrap gap-3">
          <Link to="/provider/settings">
            <Button variant="primary" size="sm">Przejdź do ustawień</Button>
          </Link>
          <Link to="/provider/dashboard">
            <Button variant="secondary" size="sm">Wróć do dashboardu</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
