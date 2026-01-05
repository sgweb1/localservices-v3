import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

/**
 * Provider Profile - MVP version (fallback)
 * Uproszczona do Settings page
 */
export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect to settings for now
    navigate('/provider/settings');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Redyrekcja do ustawień...</p>
      </div>
    </div>
  );
};
