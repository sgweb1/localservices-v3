import React from 'react';
import { AdvancedSearchBar } from './AdvancedSearchBar';
import { useLocations } from '../hooks/useLocations';
import { useCategories } from '../hooks/useCategories';
import { Spinner } from './ui/spinner';

/**
 * Kontener pobierający kategorie i lokalizacje z API
 * i renderujący AdvancedSearchBar.
 */
export const SearchBarWithData: React.FC = () => {
  const { locations, loading: locationsLoading } = useLocations();
  const { categories, loading: categoriesLoading } = useCategories();

  const isLoading = locationsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return <AdvancedSearchBar locations={locations} categories={categories} />;
};
