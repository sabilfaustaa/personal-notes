import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Notes",
    short_name: "Notes",
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait-primary",
    background_color: "#FFFFFF",
    theme_color: "#F7C948",
    lang: "id",
    dir: "ltr",
    categories: ["productivity", "utilities"],
    description: "Catatan cepat, rapi, offline-first — seperti Apple Notes.",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
