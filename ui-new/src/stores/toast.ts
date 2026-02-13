import { writable } from "svelte/store";

export interface Toast {
  id: number;
  message: string;
  type: "info" | "success" | "error" | "warning";
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  let count = 0;

  function add(message: string, type: Toast["type"] = "info", duration = 3000) {
    const id = count++;
    update((toasts) => [...toasts, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  }

  function remove(id: number) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  return {
    subscribe,
    info: (msg: string, duration?: number) => add(msg, "info", duration),
    success: (msg: string, duration?: number) => add(msg, "success", duration),
    error: (msg: string, duration?: number) => add(msg, "error", duration),
    warning: (msg: string, duration?: number) => add(msg, "warning", duration),
    remove,
  };
}

export const toast = createToastStore();
