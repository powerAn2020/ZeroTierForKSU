import { writable, derived } from 'svelte/store';
import type { LocalNetwork, CentralNetwork, CentralMember, LocalPeer } from '@/types/zerotier';
import { LocalApi } from '@/api/local';
import { CentralApi } from '@/api/central';
import { appStore } from './app';

interface ZeroTierState {
  localNetworks: LocalNetwork[];
  peers: LocalPeer[];
  centralNetworks: CentralNetwork[];
  centralMembers: Record<string, CentralMember[]>; // networkId -> members
  apiToken: string;
  loading: boolean;
}

const initialState: ZeroTierState = {
  localNetworks: [],
  peers: [],
  centralNetworks: [],
  centralMembers: {},
  apiToken: '',
  loading: false,
};

function createZeroTierStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    // Actions
    loadStatus: async () => {
      appStore.setLoading(true);
      try {
        const status = await LocalApi.getStatus();
        // Check if status is empty or missing essential fields (indicating service stopped)
        if (!status || Object.keys(status).length === 0 || !status.address) {
          appStore.setServiceStatus(false);
          appStore.setNodeInfo("", "");
        } else {
          appStore.setNodeInfo(status.version, status.address);
          // If we got a valid status object (with address), the service is running.
          // 'online' field in ZeroTier status means "connected to controller/root", not "service running".
          appStore.setServiceStatus(true);
        }
      } catch (e) {
        console.error("Failed to load status", e);
        // If it's a critical error not handled by api layer, we might still want to show it,
        // but for now let's assume valid error means something else is wrong.
        appStore.setError("Failed to load status");
        appStore.setServiceStatus(false);
      } finally {
        appStore.setLoading(false);
      }
    },

    loadLocalNetworks: async () => {
      update(s => ({ ...s, loading: true }));
      try {
        const networks = await LocalApi.getNetworks();
        update(s => ({ ...s, localNetworks: networks }));
      } catch (e) {
        console.error(e);
      } finally {
        update(s => ({ ...s, loading: false }));
      }
    },

    loadPeers: async () => {
      update(s => ({ ...s, loading: true }));
      try {
        const peers = await LocalApi.getPeers();
        update(s => ({ ...s, peers: peers }));
      } catch (e) {
        console.error(e);
      } finally {
        update(s => ({ ...s, loading: false }));
      }
    },

    loadCentralNetworks: async () => {
      appStore.setLoading(true);
      try {
        const networks = await CentralApi.getNetworks();
        update(s => ({ ...s, centralNetworks: networks }));
      } catch (e) {
        console.error(e);
      } finally {
        appStore.setLoading(false);
      }
    },

    loadCentralMembers: async (networkId: string) => {
      appStore.setLoading(true);
      try {
        const members = await CentralApi.getMembers(networkId);
        update(s => ({
          ...s,
          centralMembers: { ...s.centralMembers, [networkId]: members }
        }));
      } catch (e) {
        console.error(e);
      } finally {
        appStore.setLoading(false);
      }
    },

    updateCentralMember: (networkId: string, memberId: string, changes: Partial<CentralMember>) => {
      update(s => ({
        ...s,
        centralMembers: {
          ...s.centralMembers,
          [networkId]: (s.centralMembers[networkId] || []).map(m =>
            m.nodeId === memberId ? { ...m, ...changes } : m
          )
        }
      }));
    },

    setApiToken: (token: string) => update(s => ({ ...s, apiToken: token })),

    // Optimistic updates could be added here
    reset: () => set(initialState)
  };
}

export const zerotierStore = createZeroTierStore();
