"use client";

import { CheckCircle, Info, X, XCircle } from "lucide-react";
import { useToastStore, type ToastVariant } from "@/store/use-toast-store";

const variantStyles: Record<
  ToastVariant,
  { bg: string; border: string; icon: typeof Info; iconColor: string }
> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: XCircle,
    iconColor: "text-red-600",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-600",
  },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] grid gap-3">
      {toasts.map((toast) => {
        const style = variantStyles[toast.variant];
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={`flex min-w-[300px] max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-5 fade-in duration-300 ${style.bg} ${style.border}`}
            role="status"
          >
            <Icon
              className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`}
              aria-hidden="true"
            />
            <p className="flex-1 text-sm font-medium text-zinc-800">
              {toast.message}
            </p>
            <button
              aria-label="Dismiss"
              className="shrink-0 rounded-md p-0.5 text-zinc-400 transition-colors hover:text-zinc-700"
              onClick={() => removeToast(toast.id)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
