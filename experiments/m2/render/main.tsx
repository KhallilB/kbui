import "./styles.css";
import type { Spec } from "@json-render/core";
import {
  type ComponentRenderer,
  defineRegistry,
  JSONUIProvider,
  Renderer,
} from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { createRoot } from "react-dom/client";
import { catalog } from "../src/catalog";

const { registry: shipped } = defineRegistry(catalog, { components: shadcnComponents });

// display:contents keeps layout identical; the key lets the measure step box each element.
const registry = Object.fromEntries(
  Object.entries(shipped).map(([type, Component]) => {
    const Tagged: ComponentRenderer = (props) => (
      <span
        data-jr-key={(props.element as { __key?: string }).__key}
        data-jr-type={type}
        style={{ display: "contents" }}
      >
        <Component {...props} />
      </span>
    );
    return [type, Tagged];
  }),
);

declare global {
  interface Window {
    renderSpec: (spec: Spec) => void;
  }
}

const root = createRoot(document.getElementById("root") as HTMLElement);
window.renderSpec = (spec) => {
  const elements = Object.fromEntries(
    Object.entries(spec.elements ?? {}).map(([key, element]) => [key, { ...element, __key: key }]),
  );
  root.render(
    <JSONUIProvider
      registry={registry}
      initialState={(spec.state as Record<string, unknown>) ?? {}}
    >
      <Renderer spec={{ ...spec, elements }} registry={registry} />
    </JSONUIProvider>,
  );
};
