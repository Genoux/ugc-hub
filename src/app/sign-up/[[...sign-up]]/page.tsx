import { SignUp } from "@clerk/nextjs";
import { ROUTES } from "@/shared/lib/routes";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp fallbackRedirectUrl={ROUTES.creatorHome} />
    </div>
  );
}
