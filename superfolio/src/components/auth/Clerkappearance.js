// Maps Clerk's prebuilt <SignIn/> / <SignUp/> to the JobPilot dark theme
// (background / surface / foreground / amber / moss / mist,
// Fraunces / Inter / IBM Plex Mono). Single source of truth for both forms.
export const clerkAppearance = {
  variables: {
    colorPrimary: "#E2A63B",
    colorText: "white",
    colorTextSecondary: "#9AA3AF",
    colorBackground: "#141A24",
    colorInputBackground: "#1B2330",
    colorInputText: "#F2F0EA",
    borderRadius: "0.5rem",
    fontFamily: "Inter, sans-serif",
  },
  elements: {
    card: "shadow-none border-none bg-transparent p-0 w-full",
    header: "hidden",
    footer: "bg-transparent",
    socialButtonsBlockButton:
      "border border-foreground/15 hover:bg-foreground/[0.03] font-body text-sm normal-case text-foreground",
    socialButtonsBlockButtonText: "font-body text-sm text-foreground",
    dividerRow: "my-5",
    dividerLine: "bg-foreground/10",
    dividerText: "font-mono text-[11px] uppercase tracking-wide text-mist",
    formFieldLabel: "font-mono text-[11px] uppercase tracking-wide text-foreground/70",
    formFieldInput:
      "border border-foreground/15 bg-surface text-foreground focus:border-amber focus:ring-1 focus:ring-amber font-body text-sm",
    formButtonPrimary:
      "bg-amber hover:bg-amber/90 text-background font-body text-sm normal-case shadow-none",
    footerActionText: "font-body text-sm text-foreground/60",
    footerActionLink: "font-body text-sm text-amber hover:text-amber/80",
    identityPreviewText: "font-body text-sm text-foreground",
    identityPreviewEditButton: "text-amber hover:text-amber/80",
    formFieldAction: "font-body text-xs text-amber hover:text-amber/80",
    otpCodeFieldInput: "font-mono border-foreground/15 bg-surface text-foreground focus:border-amber",
  },
};