import React from 'react';
import { ServiceList } from '../features/customer/components/ServiceList';

/**
 * ServicesPage - Strona główna z listą usług
 */
export const ServicesPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 transition-colors overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,#80808014_1.5px,transparent_1.5px)] bg-[size:32px_32px] dark:bg-[radial-gradient(circle,#ffffff18_1.5px,transparent_1.5px)]"></div>
      <div className="relative z-10">
        <ServiceList />
      </div>
    </div>
  );
};
