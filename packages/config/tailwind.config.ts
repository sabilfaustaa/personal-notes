import type { Config } from "tailwindcss";

/** Apple Notes design tokens — dibagi via preset */
export const appleNotesPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          icon: "var(--accent-icon)",
        },
        "bg-app": "var(--bg-app)",
        "bg-sidebar": "var(--bg-sidebar)",
        "bg-list": "var(--bg-list)",
        "bg-elevated": "var(--bg-elevated)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        separator: "var(--separator)",
        "separator-strong": "var(--separator-strong)",
        selection: "var(--selection)",
        "selection-soft": "var(--selection-soft)",
        hover: "var(--hover)",
        field: "var(--field)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: [
          '-apple-system',
          '"SF Pro"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          '"Cascadia Code"',
          '"JetBrains Mono"',
          'ui-monospace',
          'monospace',
        ],
      },
      fontSize: {
        "note-title": ["26px", { lineHeight: "1.2", fontWeight: "700" }],
        "note-heading": ["20px", { lineHeight: "1.3", fontWeight: "700" }],
        "note-subheading": ["17px", { lineHeight: "1.3", fontWeight: "600" }],
        "note-body": ["16px", { lineHeight: "1.55", fontWeight: "400" }],
        "note-mono": ["15px", { lineHeight: "1.55" }],
        "sidebar-item": ["15px", { lineHeight: "1.3", fontWeight: "500" }],
        "list-title": ["15px", { lineHeight: "1.3", fontWeight: "600" }],
        "list-meta": ["13px", { lineHeight: "1.3" }],
      },
      spacing: {
        "4": "4px",
        "8": "8px",
        "12": "12px",
        "16": "16px",
        "20": "20px",
        "24": "24px",
        "32": "32px",
      },
      borderRadius: {
        card: "12px",
        input: "10px",
        chip: "8px",
        full: "50%",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.06)",
        row: "0 1px 1px rgba(0,0,0,.04)",
        popover: "0 10px 32px rgba(0,0,0,.16), 0 1px 3px rgba(0,0,0,.10)",
        fab: "0 4px 14px rgba(0,0,0,.18)",
      },
    },
  },
};
