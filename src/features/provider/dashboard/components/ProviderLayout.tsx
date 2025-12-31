import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const ProviderLayout: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto px-0 sm:px-4 py-0 sm:py-8 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default ProviderLayout;
