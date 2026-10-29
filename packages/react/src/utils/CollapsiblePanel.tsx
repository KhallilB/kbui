import { useRender } from "@base-ui/react/use-render";
import { cloneElement, isValidElement } from "react";

type CollapsiblePanelProps<State> = {
  nativeProps: useRender.ElementProps<"div">;
  state: State;
  render?: useRender.RenderProp<State> | undefined;
};

export function CollapsiblePanel<State extends { open: boolean }>({
  nativeProps,
  state,
  render,
}: CollapsiblePanelProps<State>) {
  const exiting = !state.open && !nativeProps.hidden;
  return useRender({
    props: {
      ...nativeProps,
      // Block focus during exit; settled hidden-until-found content stays searchable.
      inert: exiting || nativeProps.inert,
    },
    render:
      typeof render === "function"
        ? (props) => render(props, state)
        : exiting && isValidElement<{ inert?: boolean }>(render)
          ? cloneElement(render, { inert: true })
          : render,
  });
}
