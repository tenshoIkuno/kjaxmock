import { create } from 'zustand';

export type AppMenu =
  | 'chat'
  | 'clients'
  | 'speech'
  | 'patrolAudit'
  | 'settings'
  | 'dashboard'
  | null;

type CommonState = {
  selected: AppMenu;
  select: (menu: AppMenu) => void;
};

type PatrolAuditModalMode = 'none' | 'create' | 'history';

type ExtendedCommonState = CommonState & {
  // controls PatrolAudit page modal behaviour when navigating from navbar
  patrolAuditModalMode: PatrolAuditModalMode;
  setPatrolAuditModalMode: (m: PatrolAuditModalMode) => void;
  // persistent request used when navigating to the patrolAudit page so the page
  // can open in a specific mode (create/history) for a given client.
  patrolAuditRequestedMode: PatrolAuditModalMode;
  patrolAuditRequestedClientId: string | null;
  setPatrolAuditRequested: (
    m: PatrolAuditModalMode,
    clientId?: string | null,
  ) => void;
  clearPatrolAuditRequested: () => void;
};

export const useCommonStore = create<ExtendedCommonState>((set) => ({
  selected: 'dashboard',
  select: (menu) => set({ selected: menu }),
  patrolAuditModalMode: 'none',
  setPatrolAuditModalMode: (m: PatrolAuditModalMode) =>
    set({ patrolAuditModalMode: m }),
  patrolAuditRequestedMode: 'none',
  patrolAuditRequestedClientId: null,
  setPatrolAuditRequested: (
    m: PatrolAuditModalMode,
    clientId: string | null = null,
  ) =>
    set({
      patrolAuditRequestedMode: m,
      patrolAuditRequestedClientId: clientId,
    }),
  clearPatrolAuditRequested: () =>
    set({
      patrolAuditRequestedMode: 'none',
      patrolAuditRequestedClientId: null,
    }),
}));
