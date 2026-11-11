// Usage of useLazyReady (reconstructed from the article).
// Keep the Suspense + error boundary: they still catch failed imports, and any
// suspension if React's private lazy fields ever change.

import { lazy, Suspense } from "react";
import { useLazyReady } from "./useLazyReady";
import { ErrorBoundary, WidgetError, WidgetLoading } from "./ui"; // your own components

const WidgetComponent = lazy(() => import("./widgets/Clock"));

function Widget({ config }: { config: Record<string, unknown> }) {
  const isReady = useLazyReady(WidgetComponent);
  return isReady ? <WidgetComponent {...config} /> : <WidgetLoading />;
}

export function WidgetFrame({ config }: { config: Record<string, unknown> }) {
  return (
    <ErrorBoundary fallback={<WidgetError />}>
      <Suspense fallback={<WidgetLoading />}>
        <Widget config={config} />
      </Suspense>
    </ErrorBoundary>
  );
}
