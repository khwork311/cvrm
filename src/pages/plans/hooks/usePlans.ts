/**
 * Plans SWR Hooks
 *
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { CreatePlanData, plansApi, UpdatePlanData, type PlanFilters } from '../api/plans.api';

/**
 * Hook to fetch all plans with filters
 */
export function usePlans(filters?: PlanFilters) {
  const key = filters ? ['plans', filters] : 'plans';

  return useSWR(key, () => plansApi.getAll(filters), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single plan by ID
 */
export function usePlan(id: number | null) {
  return useSWR(id ? ['plan', id] : null, () => plansApi.getById(id!), {
    revalidateOnFocus: false,
  });
}

/**
 * Hook to create a new plan
 */
export function useCreatePlan() {
  return useSWRMutation('plans', async (_key, { arg }: { arg: CreatePlanData }) => {
    return plansApi.create(arg);
  });
}

/**
 * Hook to get plans dropdown
 */
export function usePlansDropdown() {
  return useSWR('plansDropdown', () => plansApi.getDropdown());
}

/**
 * Hook to update a plan
 */
export function useUpdatePlan() {
  return useSWRMutation('plans', async (_key, { arg }: { arg: { id: number; data: UpdatePlanData } }) => {
    return plansApi.update(arg.id, arg.data);
  });
}

/**
 * Hook to delete a plan
 */
export function useDeletePlan() {
  return useSWRMutation('plans', async (_key, { arg }: { arg: number }) => {
    return plansApi.delete(arg);
  });
}

/**
 * Hook to toggle plan status
 */
export function useTogglePlanStatus() {
  return useSWRMutation('plans', async (_key, { arg }: { arg: { id: number; status: number } }) => {
    return plansApi.toggleStatus(arg.id, arg.status);
  });
}
