import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  baseUrl: string
  set: (p: Partial<SettingsState>) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
      set: (p) => set(p),
    }),
    { name: 'cvx-settings' }
  )
)