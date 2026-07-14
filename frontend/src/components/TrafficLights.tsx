"use client";

import { useEffect, useState } from "react";

/**
 * Tombol jendela gaya macOS (merah · kuning · hijau).
 * Hijau berfungsi sebagai toggle layar penuh; merah mencoba menutup jendela
 * (berfungsi pada jendela PWA terpasang); kuning dekoratif seperti chrome asli.
 */
export function TrafficLights() {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }

  const dot =
    "relative flex items-center justify-center w-[13px] h-[13px] rounded-full border-[0.5px] " +
    "transition-[filter] duration-100 active:brightness-90";

  return (
    <div className="group flex items-center gap-[8px] select-none" role="group" aria-label="Kontrol jendela">
      <button
        type="button"
        onClick={() => window.close()}
        title="Tutup"
        aria-label="Tutup jendela"
        className={`${dot} bg-[#FF5F57] border-[#E0443E]`}
      >
        <Glyph>
          <path d="M4 4l5 5M9 4l-5 5" stroke="rgba(77,0,0,.65)" strokeWidth="1.3" strokeLinecap="round" />
        </Glyph>
      </button>

      <button
        type="button"
        tabIndex={-1}
        title="Minimalkan"
        aria-label="Minimalkan (tidak tersedia di web)"
        className={`${dot} bg-[#FEBC2E] border-[#D89E24] cursor-default`}
      >
        <Glyph>
          <path d="M3 6.5h7" stroke="rgba(90,60,0,.65)" strokeWidth="1.4" strokeLinecap="round" />
        </Glyph>
      </button>

      <button
        type="button"
        onClick={toggleFullscreen}
        title={fullscreen ? "Keluar dari layar penuh" : "Layar penuh"}
        aria-label={fullscreen ? "Keluar dari layar penuh" : "Layar penuh"}
        className={`${dot} bg-[#28C840] border-[#1AAB29]`}
      >
        <Glyph>
          <path d="M3.2 9.8V6.4l3.4 3.4H3.2z" fill="rgba(0,70,0,.65)" />
          <path d="M9.8 3.2v3.4L6.4 3.2h3.4z" fill="rgba(0,70,0,.65)" />
        </Glyph>
      </button>
    </div>
  );
}

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
      className="w-[13px] h-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-75"
    >
      {children}
    </svg>
  );
}
