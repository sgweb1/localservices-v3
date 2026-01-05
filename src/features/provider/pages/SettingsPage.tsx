import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { PageTitle, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { getSettings } from '@/api/v1/settingsApi';
import { Building2, Bell, Shield, AlertCircle, Loader } from 'lucide-react';
import { BusinessProfileTab } from '../settings/BusinessProfileTab';
import { NotificationsTab } from '../settings/NotificationsTab';
import { SecurityTab } from '../settings/SecurityTab';

/**
 * Strona ustawień providera
 * 
 * CO: Centralne miejsce do zarządzania ustawieniami konta dostawcy
 * JAK: 3 zakładki (Business, Notifications, Security) z formami edycji
 * CZEMU: Dostawcy muszą móc zmienić profil, preferencje notyfikacji i bezpieczeństwo
 * 
 * Architektura:
 * 1. useQuery fetchuje ustawienia z backendu (/provider/settings)
 * 2. Tabs routuje do komponentów (BusinessProfileTab, NotificationsTab, SecurityTab)
 * 3. Każdy tab zarządza własnym stanem + mutacje
 * 4. React Query deduplikuje requesty (staleTime: 60s default)
 * 
 * Design:
 * - PageTitle gradient do wizualnego zainteresowania
 * - Glass-card background dla nowoczesnego wyglądu
 * - Responsive tabsy (ikony ukryte na mobile, tooltips zamiast)
 * - Loading skeleton (spinning loader)
 * - Error state z wyraźnym komunikatem
 */
export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get('section') || 'business';
  const [activeTab, setActiveTab] = useState(section);

  // Synchronizuj active tab z URL query param
  useEffect(() => {
    setActiveTab(section);
  }, [section]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ section: value });
  };

  // Fetch settings z backendu
  // CO: useQuery automatycznie cachuje response na staleTime: 60s
  // JAK: queryKey = ['provider', 'settings'] (deduplikuje multiple requesty)
  // CZEMU: Bez cachingu każdy tab by robił własny request
  const { data, isLoading, error } = useQuery({
    queryKey: ['provider', 'settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60, // Cache fresh przez 60s
  });

  // Loading state - spinner w center
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageTitle gradient>Ustawienia</PageTitle>
        <Card className="glass-card p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader className="w-10 h-10 text-cyan-500 animate-spin" />
            <Text className="text-gray-600 dark:text-gray-400">Ładowanie ustawień...</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Error state - wyraźny komunikat
  if (error) {
    return (
      <div className="space-y-6">
        <PageTitle gradient>Ustawienia</PageTitle>
        <Card className="glass-card border border-red-200 dark:border-red-900 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Błąd ładowania</h3>
              <Text className="text-red-700 dark:text-red-300">
                Nie udało się załadować ustawień. Spróbuj odświeżyć stronę.
              </Text>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-6">
      <PageTitle gradient>Ustawienia</PageTitle>

      <Card className="glass-card p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TooltipProvider>
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mb-6">
              {/* Business Profile Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="business" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Profil biznesu</span>
                    <span className="sm:hidden">Profil</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="sm:hidden">
                  <p>Profil biznesu</p>
                </TooltipContent>
              </Tooltip>

              {/* Notifications Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Powiadomienia</span>
                    <span className="sm:hidden">Notyfikacje</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="sm:hidden">
                  <p>Powiadomienia</p>
                </TooltipContent>
              </Tooltip>

              {/* Security Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Bezpieczeństwo</span>
                    <span className="sm:hidden">Hasło</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="sm:hidden">
                  <p>Bezpieczeństwo</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>

          {/* Business Profile Content */}
          <TabsContent value="business" className="mt-6">
            <BusinessProfileTab data={data?.data.business} />
          </TabsContent>

          {/* Notifications Content */}
          <TabsContent value="notifications" className="mt-6">
            <NotificationsTab data={data?.data.notifications} />
          </TabsContent>

          {/* Security Content */}
          <TabsContent value="security" className="mt-6">
            <SecurityTab data={data?.data.security} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsPage;

