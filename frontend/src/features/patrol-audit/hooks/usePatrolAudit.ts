import type { inputPatrolAudit } from '@/features/patrol-audit/types/patrolAudit';
import { useState } from 'react';

const initialInputPatrolAudit: inputPatrolAudit = {
  // FirstPanel
  periodStart: null,
  periodEnd: null,
  visitDate: null,
  visitMethod: '',
  nextVisitDate: null,

  // SecondPanel
  selected: [],
  otherSelected: false,
  otherText: '',

  // FifthPanel
  confirmMethod: '',
  confirmDate: null,
  confirmer: '',
};

export const usePatrolAudit = () => {
  const [values, setValues] = useState<inputPatrolAudit>(
    initialInputPatrolAudit,
  );

  const updateValues = (partial: Partial<inputPatrolAudit>) => {
    setValues((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const reset = () => setValues(initialInputPatrolAudit);

  return {
    values,
    updateValues,
    reset,
  };
};
