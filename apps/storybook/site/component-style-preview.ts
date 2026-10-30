import { type CatalogSkin, componentStyleTarget } from "./catalog-skin";
import { activeClassNames } from "./class-source";

// Preview documents isolate arbitrary CSS from catalog navigation and editor controls.
export function applyComponentStyle(doc: Document, custom: CatalogSkin["custom"]) {
  if (!custom) return () => {};
  const selector = componentStyleTarget(custom.component);
  const style = doc.createElement("style");
  style.dataset.catalogStyle = "";
  style.textContent = custom.css;
  doc.head.append(style);
  const classes = activeClassNames(custom.classes);
  const targets = new Map<Element, Set<string>>();
  const apply = () => {
    for (const target of doc.querySelectorAll(selector)) {
      const added = targets.get(target) ?? new Set<string>();
      targets.set(target, added);
      for (const name of classes) {
        if (target.classList.contains(name)) continue;
        target.classList.add(name);
        added.add(name);
      }
    }
  };
  const observer = new MutationObserver(apply);
  observer.observe(doc.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  apply();
  return () => {
    observer.disconnect();
    style.remove();
    for (const [target, added] of targets) target.classList.remove(...added);
  };
}
