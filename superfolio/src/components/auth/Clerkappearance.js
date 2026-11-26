export const clerkAppearance = {
  variables: {
    colorPrimary: "#D97706",
    colorBackground: "#FFFFFF",
    colorText: "#0F172A",
    colorTextSecondary: "#64748B",

    colorInputBackground: "#FFFFFF",
    colorInputText: "#0F172A",

    colorDanger: "#DC2626",
    colorSuccess: "#16A34A",
    colorWarning: "#D97706",

    borderRadius: "10px",
    fontFamily: "Inter, sans-serif",
  },

  elements: {
    card: `
      bg-white
      border border-slate-200
      rounded-xl
      shadow-sm
      p-8
      w-full
    `,

    rootBox: "w-full",

    headerTitle: "font-display text-2xl text-slate-900 font-semibold",

    headerSubtitle: "text-slate-500 font-body text-sm",

    socialButtonsBlockButton: `
      bg-white
      border border-slate-200
      hover:bg-slate-50
      transition-colors
      duration-150
      text-slate-800
      shadow-none
    `,

    socialButtonsBlockButtonText: "text-slate-800 font-medium text-sm",

    dividerRow: "my-6",

    dividerLine: "bg-slate-200",

    dividerText: "text-slate-400 font-mono uppercase text-[11px] tracking-wider",

    formFieldLabel: "text-slate-700 font-medium text-xs",

    formFieldInput: `
      bg-white
      border
      border-slate-300
      text-slate-900
      placeholder:text-slate-400
      focus:border-amber-600
      focus:ring-2
      focus:ring-amber-500/20
      rounded-lg
      text-sm
      transition-all
    `,

    formButtonPrimary: `
      bg-amber-600
      hover:bg-amber-700
      text-white
      font-medium
      text-sm
      transition-colors
      shadow-none
      rounded-lg
    `,

    footerActionText: "text-slate-500 text-sm",

    footerActionLink: "text-amber-700 hover:text-amber-800 font-medium",

    identityPreviewText: "text-slate-800 font-medium",

    identityPreviewEditButton: "text-amber-700 hover:text-amber-800 text-xs",

    formFieldAction: "text-amber-700 hover:text-amber-800 text-xs",

    otpCodeFieldInput: `
      bg-white
      border
      border-slate-300
      text-slate-900
      focus:border-amber-600
    `,

    formResendCodeLink: "text-amber-700 hover:text-amber-800 font-medium",

    alertText: "text-red-700 text-sm",

    alert: "bg-red-50 border border-red-200 rounded-lg p-3",

    navbar: "hidden",

    footer: "bg-transparent",

    header: "bg-transparent",
  },
};
