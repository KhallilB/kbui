import { type CatalogSkin, componentStyleTarget } from "./catalog-skin";

// Preview documents isolate arbitrary CSS from catalog navigation and editor controls.
export function applyComponentStyle(doc: Document, custom: CatalogSkin["custom"]) {
  if (!custom) return () => {};
  const style = doc.createElement("style");
  style.dataset.catalogStyle = "";
  style.textContent = custom.css;
  doc.head.append(style);
  const classes = custom.classes.split(/\s+/).filter(Boolean);
  const targets = new Map<Element, string[]>();
  const apply = () => {
    for (const target of doc.querySelectorAll(componentStyleTarget(custom.component))) {
      const added =
        targets.get(target) ?? classes.filter((name) => !target.classList.contains(name));
      targets.set(target, added);
      for (const name of classes) if (!target.classList.contains(name)) target.classList.add(name);
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
