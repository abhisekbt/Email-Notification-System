import * as React from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface QueryStateProps {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  errorTitle?: string;
  errorDescription?: string;
  children: React.ReactNode;
  skeletonCount?: number;
}

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Once data is available, it will appear here.",
  emptyAction,
  errorTitle = "Something went wrong",
  errorDescription = "Please try again in a moment.",
  children,
  skeletonCount = 3,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState title={errorTitle} description={errorDescription} action={emptyAction} />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return <>{children}</>;
}