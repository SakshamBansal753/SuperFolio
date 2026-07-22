import { SignIn } from "@clerk/clerk-react";
import AuthLayout from "./auth/AuthLayout";
import { clerkAppearance } from "./auth/clerkAppearance";

export default function SignInPage() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your board"
      subtitle="Pick up your search where you left off."
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}