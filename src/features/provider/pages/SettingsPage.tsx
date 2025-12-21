import React from 'react';
import { PageTitle, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageTitle gradient>Ustawienia</PageTitle>
      <Card className="p-8">
        <Text className="text-slate-700">Ta podstrona jest w przygotowaniu. Wkrótce ustawienia konta i firmy.</Text>
      </Card>
    </div>
  );
};

export default SettingsPage;
