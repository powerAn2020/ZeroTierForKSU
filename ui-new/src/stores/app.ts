import { writable } from 'svelte/store';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  serviceRunning: boolean;
  version: string;
  nodeId: string;
  moduleVersion: string;
  moduleVersionCode: number;
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  theme: 'system',
  serviceRunning: false,
  version: '',
  nodeId: '',
  moduleVersion: '',
  moduleVersionCode: 0,
  loading: false,
  error: null,
};

function createAppStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setTheme: (theme: AppState['theme']) => update(s => ({ ...s, theme })),
    setServiceStatus: (running: boolean) => update(s => ({ ...s, serviceRunning: running })),
    setNodeInfo: (version: string, nodeId: string) => update(s => ({ ...s, version, nodeId })),
    setModuleInfo: (version: string, code: number) => update(s => ({ ...s, moduleVersion: version, moduleVersionCode: code })),
    setLoading: (loading: boolean) => update(s => ({ ...s, loading })),
    setError: (error: string | null) => update(s => ({ ...s, error })),
    reset: () => set(initialState)
  };
}

export const appStore = createAppStore();
