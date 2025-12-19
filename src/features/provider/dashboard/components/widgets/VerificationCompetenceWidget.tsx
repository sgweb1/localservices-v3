import React from 'react';
import { ShieldCheck, Award, TrendingUp } from 'lucide-react';

/**
 * Verification Competence Widget - zgodny z localservices
 * 
 * Pokazuje aktualny poziom weryfikacji i progress do następnego poziomu.
 */
export const VerificationCompetenceWidget: React.FC = () => {
  // Mock data - zamienić na API
  const verification = {
    currentLevel: 3,
    maxLevel: 5,
    completedSteps: 7,
    totalSteps: 10,
    nextLevelReward: '+15 Trust Score™',
  };

  const percentage = (verification.completedSteps / verification.totalSteps) * 100;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="w-6 h-6 text-cyan-600" />
        <h3 className="text-lg font-bold text-gray-900">Weryfikacja</h3>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-2xl font-bold text-gradient">Poziom {verification.currentLevel}</p>
          <p className="text-xs text-gray-500">{verification.completedSteps}/{verification.totalSteps} kroków ukończonych</p>
        </div>
        <Award className="w-12 h-12 text-amber-500" />
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
        <TrendingUp className="w-4 h-4 text-cyan-600" />
        <p className="text-xs text-cyan-800 font-medium">Następny poziom: {verification.nextLevelReward}</p>
      </div>
    </div>
  );
};
