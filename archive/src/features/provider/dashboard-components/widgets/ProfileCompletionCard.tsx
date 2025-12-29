import React from 'react';
import { UserCircle, Check, Minus } from 'lucide-react';

/**
 * Profile Completion Card - zgodny z localservices
 * 
 * Progress bar + checklist ukończenia profilu.
 */
export const ProfileCompletionCard: React.FC = () => {
  // Mock data - zamienić na API
  const checklist = {
    basic_info: true,
    location: true,
    services: false,
    portfolio: false,
    verification: false,
  };

  const completed = Object.values(checklist).filter(Boolean).length;
  const total = Object.keys(checklist).length;
  const percentage = (completed / total) * 100;

  return (
    <div className="glass-card rounded-2xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <UserCircle className="w-6 h-6 text-cyan-600" />
        <h3 className="text-lg font-bold text-gray-900">Ukończenie Profilu</h3>
      </div>

      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Postęp:</p>
            <p className="text-sm font-bold text-gradient">{Math.round(percentage)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {Object.entries(checklist).map(([key, done]) => (
            <div key={key} className="flex items-center gap-3">
              {done ? (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Minus className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <p className={`text-sm flex-1 ${done ? 'text-gray-500 line-through' : 'text-cyan-600 hover:text-cyan-800'}`}>
                {key === 'basic_info' && 'Uzupełnij podstawowe informacje'}
                {key === 'location' && 'Dodaj adres i lokalizację'}
                {key === 'services' && 'Dodaj co najmniej jedną usługę'}
                {key === 'portfolio' && 'Dodaj zdjęcia do portfolio'}
                {key === 'verification' && 'Zweryfikuj tożsamość'}
              </p>
            </div>
          ))}
        </div>

        {percentage < 100 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <a href="/provider/profile/edit" className="block w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold text-center hover:shadow-lg transition-shadow">
              Uzupełnij profil teraz
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
