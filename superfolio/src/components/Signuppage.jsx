import { SignUp } from "@clerk/clerk-react";
import AuthLayout from "./auth/AuthLayout";
import { clerkAppearance } from "./auth/clerkAppearance";

export default function SignUpPage() {
  return (
    <AuthLayout
      eyebrow="Get started"
      title="Set up your board"
      subtitle="Free to start — connect Gmail whenever you're ready."
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}