import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { PlanType } from '../subscription/constants/planLimits';
import { PlansGrid } from '../subscription/components/PlansGrid';
import { PageTitle, Text } from '@/components/ui/typography';

/**
 * Plans selection page
 * /provider/subscription/plans
 */
export const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: subData, isLoading: subLoading } = useSubscription();
  const currentPlan = subData?.data?.plan || 'free';

  const handleSelectPlan = (plan: PlanType) => {
    // Redirect to checkout with plan parameter
    navigate(`/provider/subscription/checkout/${plan}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <PageTitle gradient>Plany subskrypcji</PageTitle>
        <Text muted size="sm" className="mt-2">
          Wybierz plan dostosowany do Twoich potrzeb. Zmień go w każdej chwili.
        </Text>
      </div>

      {/* Plans Grid */}
      <PlansGrid 
        currentPlan={currentPlan as PlanType}
        onSelectPlan={handleSelectPlan}
        isLoading={subLoading}
      />
    </div>
  );
};

export default PlansPage;
