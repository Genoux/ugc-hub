import { Button } from "./ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-hidden rounded-lg border">
      <div className="flex flex-col items-start gap-6 max-w-md">
        <div className="space-y-0.5">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick} size="sm" variant="outline">
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
