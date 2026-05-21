"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { useConfirmStore } from "@/store/use-confirm-store";
import { Button } from "@/components/ui/button";

export function ConfirmModal() {
  const {
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant,
    onConfirm,
    onCancel,
  } = useConfirmStore();

  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel?.();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => onCancel?.()}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-start gap-4">
          {variant === "danger" ? (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100">
              <AlertTriangle
                className="h-5 w-5 text-red-600"
                aria-hidden="true"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            onClick={() => onCancel?.()}
            type="button"
            variant="outline"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={() => onConfirm?.()}
            ref={confirmRef}
            type="button"
            variant={variant === "danger" ? "destructive" : "default"}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
