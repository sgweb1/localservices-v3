import React from 'react';
import { useServices } from '../dashboard/hooks/useServices';
import { Briefcase, Plus, Edit, Eye } from 'lucide-react';
import { PageTitle, Text, Badge, Caption, EmptyText, CardTitle, StatValue } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Services Page - zgodny z localservices
 * 
 * Grid usług z obrazkami, views, edycją.
 */
export const ServicesPage: React.FC = () => {
  const { data, isLoading, error } = useServices();
  const items = data?.data ?? [];
  const activeCount = data?.counts?.active ?? 0;
  const inactiveCount = data?.counts?.inactive ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <PageTitle gradient>Moje Usługi</PageTitle>
          <Text muted size="sm" className="mt-2">
            <Badge variant="success">{activeCount} aktywnych</Badge> · <Badge variant="default">{inactiveCount} nieaktywnych</Badge>
          </Text>
        </div>
        <Button
          onClick={() => window.location.href = '/provider/services/create'}
          className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
        >
          <Plus className="w-5 h-5" />
          Dodaj usługę
        </Button>
      </div>

      {/* Grid usług */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading && (
          <div className="col-span-full text-center py-12"><EmptyText>Ładowanie...</EmptyText></div>
        )}
        {error && !isLoading && (
          <div className="col-span-full text-center py-12"><EmptyText className="text-red-600">Błąd ładowania usług</EmptyText></div>
        )}
        {!isLoading && items.map(s => (
          <Card key={s.id} className="overflow-hidden hover:shadow-lg transition-all">
            {/* Image placeholder */}
            <div className="h-48 bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Briefcase className="w-16 h-16 text-white opacity-50" />
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <CardTitle>{s.name}</CardTitle>
                <Badge variant={s.status==='active' ? 'success' : 'default'}>
                  {s.status === 'active' ? 'Aktywna' : 'Nieaktywna'}
                </Badge>
              </div>
              <Caption muted className="mb-3">{s.category}</Caption>
              <StatValue gradient className="mb-4">{s.price}</StatValue>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4">
                <Caption className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>0 wyświetleń</span>
                </Caption>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.location.href = `/provider/services/edit/${s.id}`}
                  className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <Edit className="w-4 h-4" />
                  Edytuj
                </Button>
                <Button className="text-cyan-600 hover:bg-cyan-50">
                  Podgląd
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {!isLoading && items.length===0 && (
          <div className="col-span-full text-center py-12">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <EmptyText className="mb-2 text-base">Brak usług w ofercie</EmptyText>
            <Text muted size="sm" className="mb-6">Dodaj pierwszą usługę, aby klienci mogli Cię znaleźć</Text>
            <Button
              onClick={() => window.location.href = '/provider/services/create'}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
            >
              <Plus className="w-5 h-5" />
              Dodaj pierwszą usługę
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
