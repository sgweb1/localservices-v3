import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DevToolsPanel } from './DevToolsPanel';

export const ProviderLayout: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
      <DevToolsPanel />
    </div>
  );
};

export default ProviderLayout;
