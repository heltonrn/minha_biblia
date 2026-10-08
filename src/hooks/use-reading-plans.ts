import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getReadingPlans, type ReadingPlanRow } from '@/src/db/queries';

export type PlanStatus = 'not_started' | 'in_progress' | 'finished';

export interface ReadingPlanWithProgress extends ReadingPlanRow {
  status: PlanStatus;
  /** 0–1 */
  progress: number;
  /** Próximo dia a ler (limitado à duração do plano). */
  currentDay: number;
}

export function withProgress(plan: ReadingPlanRow): ReadingPlanWithProgress {
  const status: PlanStatus = !plan.started_at
    ? 'not_started'
    : plan.completed_days >= plan.duration_days
      ? 'finished'
      : 'in_progress';
  return {
    ...plan,
    status,
    progress: plan.duration_days > 0 ? Math.min(plan.completed_days / plan.duration_days, 1) : 0,
    currentDay: Math.min(plan.completed_days + 1, plan.duration_days),
  };
}

/**
 * Planos de leitura (definidos no bible.db) com o estado do usuário.
 * Recarrega ao voltar para a aba, para refletir dias marcados no detalhe.
 */
export function useReadingPlans() {
  const [plans, setPlans] = useState<ReadingPlanWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getReadingPlans()
        .then((rows) => active && setPlans(rows.map(withProgress)))
        .catch((error) => console.error('Falha ao carregar os planos', error))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [])
  );

  return { plans, loading };
}
