// Usage of useLoadedComponent (reconstructed from the article).
// The loader must be stable across renders, so define it once at module level.

import { useLoadedComponent } from "./useLoadedComponent";
import { WidgetLoading } from "./ui"; // your own placeholder

const loadNotes = () => import("./NotesWidget");

export const Notes = (props: Record<string, unknown>) => {
  const Widget = useLoadedComponent(loadNotes);
  return Widget ? <Widget {...props} /> : <WidgetLoading />;
};
