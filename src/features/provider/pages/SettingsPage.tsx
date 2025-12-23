import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTitle } from '@/components/ui/typography';
import { getSettings } from '@/api/v1/settingsApi';
import { Building2, Bell, Shield } from 'lucide-react';
import { BusinessProfileTab } from '../settings/BusinessProfileTab';
import { NotificationsTab } from '../settings/NotificationsTab';
import { SecurityTab } from '../settings/SecurityTab';

/**
 * Strona ustawień providera
 * 
 * Zakładki:
 * 1. Profil biznesu - nazwa, logo, bio, social media
 * 2. Powiadomienia - email i push preferences
 * 3. Bezpieczeństwo - zmiana hasła, 2FA
 */
export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get('section') || 'business';
  const [activeTab, setActiveTab] = useState(section);

  useEffect(() => {
    setActiveTab(section);
  }, [section]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ section: value });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['provider', 'settings'],
    queryFn: getSettings,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p className="text-red-600">Błąd ładowania ustawień</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle gradient>Ustawienia</PageTitle>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Profil biznesu</span>
            <span className="sm:hidden">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Powiadomienia</span>
            <span className="sm:hidden">Notyfikacje</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Bezpieczeństwo</span>
            <span className="sm:hidden">Hasło</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-6">
          <BusinessProfileTab data={data?.data.business} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab data={data?.data.notifications} />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityTab data={data?.data.security} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;

