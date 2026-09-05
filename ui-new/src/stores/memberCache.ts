import { writable } from "svelte/store";
import { STORAGE_KEYS, getStorageItem } from "@/lib/utils";

const CACHE_KEY = STORAGE_KEYS.MEMBER_NAMES;

function createMemberCache() {
  // Read initial cache from localStorage
  let initialData: Record<string, string> = {};
  if (typeof localStorage !== "undefined") {
    const raw = getStorageItem(CACHE_KEY, "ZerotierForKSU.member_names", "zt_member_names");
    if (raw) {
      try {
        initialData = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse member cache", e);
      }
    }
  }

  const { subscribe, update } = writable<Record<string, string>>(initialData);

  return {
    subscribe,
    setName: (nodeId: string, name: string) => {
      update((current) => {
        if (!name || current[nodeId] === name) return current;
        const next = { ...current, [nodeId]: name };
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    setNames: (members: { nodeId: string; name?: string }[]) => {
      update((current) => {
        let changed = false;
        const next = { ...current };
        for (const m of members) {
          if (m.name && next[m.nodeId] !== m.name) {
            next[m.nodeId] = m.name;
            changed = true;
          }
        }
        if (changed && typeof localStorage !== "undefined") {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        }
        return changed ? next : current;
      });
    },
    removeName: (nodeId: string) => {
      update((current) => {
        if (current[nodeId] === undefined) return current;
        const next = { ...current };
        delete next[nodeId];
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
  };
}

export const memberCache = createMemberCache();
