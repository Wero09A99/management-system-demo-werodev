/**
 * Design tokens — color.
 *
 * Naming: `brand` es el único color de acento y se usa con disciplina,
 * nunca de forma decorativa. El resto de la UI es neutra.
 */
export const colors = {
  brand: {
    /** Acento principal. Hex #0B5FFF (azul de referencia Linear/Stripe). */
    50: "#EFF5FF",
    100: "#DBE8FE",
    500: "#0B5FFF",
    600: "#0A4FE0",
    700: "#083BB5",
  },

  neutral: {
    0: "#FFFFFF",
    50: "#FAFAFa",
    100: "#F4F4F5",
    200: "#E4E4E7",
    300: "#D4D4D8",
    400: "#A1A1AA",
    500: "#71717A",
    600: "#52525B",
    700: "#3F3F46",
    800: "#27272A",
    900: "#18181B",
    950: "#09090B",
  },

  status: {
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
    info: "#0B5FFF",
  },
} as const;

export type BrandColor = keyof typeof colors.brand;
export type NeutralColor = keyof typeof colors.neutral;
export type StatusColor = keyof typeof colors.status;