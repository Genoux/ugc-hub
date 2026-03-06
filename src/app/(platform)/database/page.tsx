import { getCreators } from "@/features/creators/actions/admin/get-creators";
import { CreatorDatabase } from "@/features/creators/components/admin/creator-database";

export const metadata = {
  title: "Creator Database | UGC Hub",
  description: "Browse and manage UGC creators",
};

export default async function DatabasePage() {
  const result = await getCreators();

  if (!result.success) {
    return (
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Failed to load creators</h2>
          <p className="text-sm text-muted-foreground">{result.error ?? "An error occurred"}</p>
        </div>
      </div>
    );
  }

  return <CreatorDatabase creators={result.creators} />;
}
