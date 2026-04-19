import { create } from 'zustand';

interface UIState {
  // Toast notifications
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;

  // Modals
  confirmModal: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  };

  // Theme
  theme: 'light' | 'dark';

  // Actions
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  },
  theme: 'light',

  addToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: Math.random().toString(36).substr(2, 9),
          message,
          type,
        },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  openConfirm: (title, message, onConfirm) =>
    set({
      confirmModal: {
        isOpen: true,
        title,
        message,
        onConfirm,
      },
    }),

  closeConfirm: () =>
    set({
      confirmModal: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
      },
    }),

  setTheme: (theme) => set({ theme }),
}));
