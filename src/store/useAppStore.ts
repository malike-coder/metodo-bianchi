import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppView, ClientScreen, BianchClient, WizardFormData } from '../types/bianchi';
import { DEFAULT_WIZARD_FORM } from '../types/bianchi';
import { mockClients } from '../data/mockClients';

interface AppState {
  // ── View & Navigation ──────────────────────────
  activeView: AppView;
  clientScreen: ClientScreen;
  wizardStep: number;

  // ── Theme ──────────────────────────────────────
  isDarkMode: boolean;

  // ── Wizard Form Data ──────────────────────────
  form: WizardFormData;

  // ── Results ───────────────────────────────────
  currentClient: BianchClient;
  activeProfClientIndex: number;
  profClients: BianchClient[];

  // ── Actions ───────────────────────────────────
  setActiveView: (view: AppView) => void;
  setClientScreen: (screen: ClientScreen) => void;
  setWizardStep: (step: number) => void;
  toggleDarkMode: () => void;
  updateForm: (data: Partial<WizardFormData>) => void;
  resetForm: () => void;
  setCurrentClient: (client: BianchClient) => void;
  setActiveProfClient: (index: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeView: 'client',
      clientScreen: 'welcome',
      wizardStep: 1,
      isDarkMode: false,
      form: DEFAULT_WIZARD_FORM,
      currentClient: mockClients[0],
      activeProfClientIndex: 0,
      profClients: mockClients,

      setActiveView: (view) => set({ activeView: view }),
      setClientScreen: (screen) => set({ clientScreen: screen }),
      setWizardStep: (step) => set({ wizardStep: step }),
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      updateForm: (data) => set((s) => ({ form: { ...s.form, ...data } })),
      resetForm: () => set({ form: DEFAULT_WIZARD_FORM, wizardStep: 1 }),
      setCurrentClient: (client) => set({ currentClient: client }),
      setActiveProfClient: (index) => set({ activeProfClientIndex: index }),
    }),
    {
      name: 'bianchi-app-state',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        // Don't persist form or client data in Phase 1
      }),
    }
  )
);
