import { writable } from 'svelte/store';
import { STORAGE_KEYS, getStorageItem } from '@/lib/utils';

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

const getInitialNodeId = (): string => {
  return getStorageItem(STORAGE_KEYS.NODE_ID, 'ZerotierForKSU.nodeId') || '';
};

const initialState: AppState = {
  theme: 'system',
  serviceRunning: false,
  version: '',
  nodeId: getInitialNodeId(),
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
    setNodeInfo: (version: string, nodeId: string) => update(s => {
      let finalNodeId = nodeId;
      if (finalNodeId) {
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEYS.NODE_ID, finalNodeId);
          } catch (e) {
            console.error('Failed to cache nodeId', e);
          }
        }
      } else {
        finalNodeId = s.nodeId || getInitialNodeId();
      }
      return { ...s, version, nodeId: finalNodeId };
    }),
    setModuleInfo: (version: string, code: number) => update(s => ({ ...s, moduleVersion: version, moduleVersionCode: code })),
    setLoading: (loading: boolean) => update(s => ({ ...s, loading })),
    setError: (error: string | null) => update(s => ({ ...s, error })),
    reset: () => set(initialState)
  };
}

export const appStore = createAppStore();
