/**
 * Veya brand palette and Ant Design theme tokens.
 *
 * The palette is the single source of truth for console branding: primary
 * actions, links, selected states, and dark surfaces all reference these
 * values. Keep the values in sync with `public/favicon.svg` and the logo
 * component when re-branding.
 */
export const VEYA_PALETTE = {
  /** Brand violet — primary buttons, links, active menu states. */
  primary: '#6A5CFF',
  /** Brand cyan — gradient accent and highlight tones. */
  accent: '#00C8FF',
  /** Deep ink — dark surfaces such as the layout sidebar. */
  ink: '#141328',
  /** Light page background behind content cards. */
  bgLayout: '#f5f6fb',
} as const;

/** Brand gradient used by the logo mark and decorative surfaces. */
export const VEYA_GRADIENT = `linear-gradient(135deg, ${VEYA_PALETTE.primary} 0%, ${VEYA_PALETTE.accent} 100%)`;

/** Ant Design theme configuration consumed by the root `ConfigProvider`. */
export const antdTheme = {
  token: {
    colorPrimary: VEYA_PALETTE.primary,
    colorInfo: VEYA_PALETTE.primary,
    colorLink: VEYA_PALETTE.primary,
    borderRadius: 8,
    colorBgLayout: VEYA_PALETTE.bgLayout,
  },
} as const;
