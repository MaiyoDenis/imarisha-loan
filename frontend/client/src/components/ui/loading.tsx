import { Spinner } from "@/components/ui/spinner";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-8" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
