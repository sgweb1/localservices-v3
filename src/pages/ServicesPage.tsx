import React from 'react';
import { ServiceList } from '../features/customer/components/ServiceList';

/**
 * ServicesPage - Strona główna z listą usług
 */
export const ServicesPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <ServiceList />
    </div>
  );
};
