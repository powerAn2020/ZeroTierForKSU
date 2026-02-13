import { writable } from "svelte/store";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
}

function createConfirmStore() {
  const { subscribe, set, update } = writable<{
    isOpen: boolean;
    options: ConfirmOptions;
  }>({
    isOpen: false,
    options: {
      message: "",
      onConfirm: () => { },
    },
  });

  return {
    subscribe,
    open: (options: ConfirmOptions) => {
      set({ isOpen: true, options });
    },
    close: () => {
      update((state) => ({ ...state, isOpen: false }));
    },
  };
}

export const confirm = createConfirmStore();
