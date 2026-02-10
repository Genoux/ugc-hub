import { AlertCircle } from "lucide-react";

export default function CreatorNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <AlertCircle className="size-16 text-muted-foreground" />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Submission Link Not Found</h1>
          <p className="text-muted-foreground">
            This submission link doesn't exist or has been removed. Please contact the campaign
            organizer for a new link.
          </p>
        </div>
      </div>
    </div>
  );
}
