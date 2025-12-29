import React from 'react';
import { DashboardWidgets } from '../types';
import {
  PlanCard,
  AddonsCarousel,
  PipelineBoard,
  InsightsCard,
  TasksCard,
  PerformanceSnapshot,
  CalendarGlance,
  MessageCenter,
  NotificationsCard,
  ServicesCard,
} from './widgets';

interface DashboardGridProps {
  widgets: DashboardWidgets;
}

/**
 * Dashboard Grid Layout
 * 
 * CSS Grid layout dla 10 widgetów. Responsywny breakpoint:
 * - Mobile: 1 kolumna
 * - Tablet: 2 kolumny
 * - Desktop: 3 kolumny
 * 
 * Widgets rozciągają się wg zaprojektowanego layoutu.
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({ widgets }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min">
      {/* Row 1: Plan Card (span 1) + Addons (span 2) */}
      <div className="xl:col-span-1">
        <PlanCard data={widgets.plan_card} />
      </div>
      <div className="xl:col-span-2">
        <AddonsCarousel data={widgets.addons_carousel} />
      </div>

      {/* Row 2: Pipeline (span 1) + Insights (span 1) + Tasks (span 1) */}
      <div>
        <PipelineBoard data={widgets.pipeline_board} />
      </div>
      <div>
        <InsightsCard data={widgets.insights_card} />
      </div>
      <div>
        <TasksCard data={widgets.tasks_card} />
      </div>

      {/* Row 3: Performance (span 1) + Calendar (span 1) + Messages (span 1) */}
      <div>
        <PerformanceSnapshot data={widgets.performance_snapshot} />
      </div>
      <div>
        <CalendarGlance data={widgets.calendar_glance} />
      </div>
      <div>
        <MessageCenter data={widgets.message_center} />
      </div>

      {/* Row 4: Notifications (span 1) + Services (span 2) */}
      <div>
        <NotificationsCard data={widgets.notifications_card} />
      </div>
      <div className="xl:col-span-2">
        <ServicesCard data={widgets.services_card} />
      </div>
    </div>
  );
};
