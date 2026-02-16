import { listCreators } from "@/features/creators/actions/list-creators";
import { CreatorDatabase } from "@/features/creators/components/creator-database";
import { creatorSchema } from "@/features/creators/schemas";

export const metadata = {
  title: "Creator Database | UGC Hub",
  description: "Browse and manage UGC creators",
};

export default async function DatabasePage() {
  const result = await listCreators();

  if (!result.success || !result.creators) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Failed to load creators
          </h2>
          <p className="text-sm text-muted-foreground">
            {result.error || "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // Parse and validate creators
  const creators = result.creators.map((c) => {
    try {
      return creatorSchema.parse(c);
    } catch (error) {
      console.error("Failed to parse creator:", error);
      return null;
    }
  }).filter((c): c is NonNullable<typeof c> => c !== null);

  return <CreatorDatabase creators={creators} />;
}
