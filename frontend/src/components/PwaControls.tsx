"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Mengelola siklus PWA secara client-only:
 * - Registrasi service worker + deteksi update (toast "muat ulang").
 * - Tombol "Install" muncul saat browser mengizinkan (beforeinstallprompt).
 */
export function PwaControls() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // SW hanya di produksi — di dev ia bisa menyajikan chunk _next basi & merusak HMR.
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          if (reg.waiting) setWaiting(reg.waiting);
          reg.addEventListener("updatefound", () => {
            const sw = reg.installing;
            if (!sw) return;
            sw.addEventListener("statechange", () => {
              if (sw.state === "installed" && navigator.serviceWorker.controller) {
                setWaiting(sw);
              }
            });
          });
        })
        .catch(() => {});

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  function applyUpdate() {
    waiting?.postMessage("SKIP_WAITING");
  }

  return (
    <>
      {installEvent && (
        <button
          onClick={install}
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-strong
                     px-2 py-1 rounded-md hover:bg-accent/10 transition-colors cursor-pointer"
          title="Pasang Notes sebagai aplikasi"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pasang</span>
        </button>
      )}

      {waiting && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5
                        rounded-full bg-bg-elevated border border-separator shadow-popover animate-slide-in">
          <span className="text-sm text-text-primary">Versi baru tersedia</span>
          <button
            onClick={applyUpdate}
            className="flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-strong
                       transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Muat ulang
          </button>
        </div>
      )}
    </>
  );
}
