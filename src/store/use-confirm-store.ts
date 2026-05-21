"use client";

import { create } from "zustand";

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: "danger" | "default";
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  open: (opts: {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
  }) => Promise<boolean>;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: "Confirm",
  message: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: "default",
  onConfirm: null,
  onCancel: null,
  open: (opts) =>
    new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title: opts.title ?? "Confirm",
        message: opts.message,
        confirmLabel: opts.confirmLabel ?? "Confirm",
        cancelLabel: opts.cancelLabel ?? "Cancel",
        variant: opts.variant ?? "default",
        onConfirm: () => {
          set({ isOpen: false, onConfirm: null, onCancel: null });
          resolve(true);
        },
        onCancel: () => {
          set({ isOpen: false, onConfirm: null, onCancel: null });
          resolve(false);
        },
      });
    }),
  close: () => set({ isOpen: false, onConfirm: null, onCancel: null }),
}));
