/**
 * Design tokens — tipografía y escala tipográfica.
 * Montserrat con escala intencional: compacta para datos, mayor en títulos.
 */
export const typography = {
  fontFamily: {
    sans: "var(--font-montserrat)",
    mono: "var(--font-montserrat)",
  },

  size: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },

  weight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  tracking: {
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
  },

  leading: {
    tight: "1.25",
    normal: "1.5",
    loose: "1.75",
  },
} as const;