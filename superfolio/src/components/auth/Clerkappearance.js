export const clerkAppearance = {
  variables: {
    colorPrimary: "#3B82F6",
    colorBackground: "#141A24",
    colorText: "#F8FAFC",
    colorTextSecondary: "#94A3B8",

    colorInputBackground: "#1E293B",
    colorInputText: "#F8FAFC",

    colorDanger: "#EF4444",
    colorSuccess: "#22C55E",
    colorWarning: "#F59E0B",

    borderRadius: "12px",

    fontFamily: "Inter, sans-serif",
  },

  elements: {
    card: `
      bg-[#141A24]
      border border-white/10
      rounded-2xl
      shadow-2xl
      backdrop-blur-xl
      p-8
      w-full
    `,

    rootBox: "w-full",

    headerTitle:
      "font-display text-3xl text-white font-semibold",

    headerSubtitle:
      "text-slate-400 font-body",

    socialButtonsBlockButton: `
      bg-[#1E293B]
      border border-slate-700
      hover:bg-[#273548]
      transition-all
      duration-200
      text-white
    `,

    socialButtonsBlockButtonText:
      "text-white font-medium",

    dividerRow: "my-6",

    dividerLine: "bg-slate-700",

    dividerText:
      "text-slate-400 font-mono uppercase text-xs tracking-widest",

    formFieldLabel:
      "text-slate-300 font-medium",

    formFieldInput: `
      bg-[#1E293B]
      border
      border-slate-700
      text-white
      placeholder:text-slate-500
      focus:border-blue-500
      focus:ring-2
      focus:ring-blue-500/30
      transition-all
    `,

    formButtonPrimary: `
      bg-blue-600
      hover:bg-blue-500
      text-white
      font-medium
      transition-all
      shadow-lg
      hover:shadow-blue-500/30
    `,

    footerActionText:
      "text-slate-400",

    footerActionLink:
      "text-blue-400 hover:text-blue-300",

    identityPreviewText:
      "text-white",

    identityPreviewEditButton:
      "text-blue-400 hover:text-blue-300",

    formFieldAction:
      "text-blue-400 hover:text-blue-300",

    otpCodeFieldInput: `
      bg-[#1E293B]
      border
      border-slate-700
      text-white
      focus:border-blue-500
    `,

    formResendCodeLink:
      "text-blue-400 hover:text-blue-300",

    alertText:
      "text-red-400",

    alert:
      "bg-red-500/10 border border-red-500/30 rounded-lg",

    navbar:
      "hidden",

    footer:
      "bg-transparent",

    header:
      "bg-transparent",
  },
};