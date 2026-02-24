import { Suspense } from "react";
import SigningOutClient from "./client";

export default function SigningOutPage() {
  return (
    <Suspense>
      <SigningOutClient />
    </Suspense>
  );
}
