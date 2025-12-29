import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TextGradient } from '@/components/ui/TextGradient';
import { BadgeGradient } from '@/components/ui/BadgeGradient';
import { TasksCard as TasksCardType } from '../../types';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface TasksCardProps {
  data: TasksCardType;
}

/**
 * Widget: Tasks Card
 * 
 * Onboarding + growth tasks z user->onboarding_steps + dodatkowe
 * (portfolio ≥3 zdjęcia, włączenie Instant Booking). Progres w %.
 */
export const TasksCard: React.FC<TasksCardProps> = ({ data }) => {
  const completedCount = data.items.filter(item => item.completed).length;
  const visibleTasks = data.items.slice(0, 5);

  return (
    <GlassCard className="rounded-2xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Zadania</h3>
          <div className="text-right">
            <TextGradient className="text-2xl font-bold block">
              {data.progress}%
            </TextGradient>
            <p className="text-xs text-gray-500 mt-0.5">
              {completedCount}/{data.items.length} ukończonych
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
            style={{ width: `${data.progress}%` }}
          />
        </div>

        {/* Tasks list */}
        <div className="space-y-2">
          {visibleTasks.map((task) => (
            <a
              key={task.id}
              href={task.route}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group"
            >
              {/* Checkbox */}
              <div className="flex-shrink-0 mt-0.5">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 group-hover:text-primary-400 transition-colors" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  task.completed ? 'line-through text-gray-400' : 'text-gray-900'
                }`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                
                {task.reward && !task.completed && (
                  <BadgeGradient className="mt-2">{task.reward}</BadgeGradient>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 group-hover:text-primary-600 transition-colors" />
            </a>
          ))}
        </div>

        {/* Footer */}
        {data.progress < 100 && (
          <button className="btn-gradient w-full mt-4">
            Uzupełnij profil
          </button>
        )}
      </div>
    </GlassCard>
  );
};
