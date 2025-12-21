import React from 'react';
import { PageTitle, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';

export const SupportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageTitle gradient>Wsparcie</PageTitle>
      <Card className="p-8">
        <Text className="text-slate-700">Ta podstrona jest w przygotowaniu. Wkrótce kontakt i centrum pomocy.</Text>
      </Card>
    </div>
  );
};

export default SupportPage;
