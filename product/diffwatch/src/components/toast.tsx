"use client";

import { useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

const typeStyles: Record<ToastType, string> = {
  success: "bg-emerald-900/90 border-emerald-700 text-emerald-100",
  error: "bg-red-900/90 border-red-700 text-red-100",
  info: "bg-zinc-800/90 border-zinc-700 text-zinc-100",
};

const typeIcons: Record<ToastType, string> = {
  success: "ok",
  error: "!",
  info: "i",
};

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    visible: false,
  });

  const show = useCallback((message: string, type: ToastType = "info") => {
    setToast({ message, type, visible: true });
  }, []);

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.visible, toast.message]);

  return { show, toast };
}

export function Toast({ toast }: { readonly toast: ToastState }) {
  if (!toast.visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur transition-all ${typeStyles[toast.type]}`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/20 text-xs font-bold">
        {typeIcons[toast.type]}
      </span>
      {toast.message}
    </div>
  );
}
