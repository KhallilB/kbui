import {
  type ComponentProps,
  type ComponentType,
  createContext,
  type ReactNode,
  useContext,
} from "react";
import { kb } from "../../utils/kb";

export type LinkProps = ComponentProps<"a"> & {
  /** Navigation destination; use Button for actions. */
  href: string;
};

/** Router adapter contract: render an anchor with href; pass other props and ref through. */
export type LinkComponent = "a" | ComponentType<LinkProps>;

const LinkComponentContext = createContext<LinkComponent>("a");

export type LinkProviderProps = {
  /** Renders every kbui anchor below it; adapt your router's link here. */
  component: LinkComponent;
  children?: ReactNode;
};

function LinkProvider({ component, children }: LinkProviderProps) {
  return (
    <LinkComponentContext.Provider value={component}>{children}</LinkComponentContext.Provider>
  );
}

export function useLinkComponent(): LinkComponent {
  return useContext(LinkComponentContext);
}

function LinkRoot({ className, ...props }: LinkProps) {
  const Anchor = useLinkComponent();
  return <Anchor {...props} {...kb("link", {}, className)} />;
}

export const Link = Object.assign(LinkRoot, { Provider: LinkProvider });
