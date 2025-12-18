import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import { ServiceCard } from './ServiceCard';

/**
 * ServiceFilter - Komponent filtru usług
 */
const ServiceFilter: React.FC<{
  onFilterChange: (filters: Record<string, any>) => void;
}> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');

  const handleApply = () => {
    onFilterChange({
      category: category || undefined,
      city: city || undefined,
      search: search || undefined,
    });
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Wyszukaj usługę..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center gap-2 transition-colors"
        >
          <Filter size={18} />
          Filtry
        </button>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Wszystkie</option>
                <option value="plumbing">Hydraulika</option>
                <option value="electrical">Elektyka</option>
                <option value="cleaning">Sprzątanie</option>
                <option value="tutoring">Nauka</option>
                <option value="caregiving">Opieka</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Miasto
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Wszystkie</option>
                <option value="Wrocław">Wrocław</option>
                <option value="Poznań">Poznań</option>
                <option value="Gdańsk">Gdańsk</option>
                <option value="Kraków">Kraków</option>
                <option value="Warszawa">Warszawa</option>
              </select>
            </div>

            {/* Action */}
            <div className="flex items-end">
              <button
                onClick={handleApply}
                className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-medium transition-colors"
              >
                Zastosuj filtry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ServiceList - Lista usług z paginacją i filtrami
 */
export const ServiceList: React.FC = () => {
  const { services, loading, error, pagination, fetchServices } = useServices();
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Fetch initial data
  React.useEffect(() => {
    fetchServices(1, filters);
  }, []);

  const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    fetchServices(1, newFilters);
  }, [fetchServices]);

  const handlePaginationChange = (page: number) => {
    fetchServices(page, filters);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Błąd: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Dostępne usługi
        </h1>
        <p className="text-lg text-gray-600">
          Znaleziono <span className="font-semibold">{pagination.total}</span> usług
        </p>
      </div>

      {/* Filter */}
      <ServiceFilter onFilterChange={handleFilterChange} />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {/* Services Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={(s) => console.log('Kliknięto usługę:', s)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => handlePaginationChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: pagination.last_page }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePaginationChange(i + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pagination.current_page === i + 1
                        ? 'bg-cyan-500 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePaginationChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Empty State */}
          {services.length === 0 && !loading && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Brak usług
              </h3>
              <p className="text-gray-600">
                Spróbuj zmienić filtry
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
