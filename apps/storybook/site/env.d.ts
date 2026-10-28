/// <reference types="vite/client" />

declare module "virtual:kbui-reference" {
  const references: Record<string, import("../catalog/types").ComponentReference>;
  export default references;
}

declare module "virtual:kbui-catalog" {
  const entries: import("../catalog/types").CatalogEntry[];
  export default entries;
}

declare module "virtual:kbui-site-samples" {
  const samples: {
    playground: Record<string, import("../catalog/types").CodeSample>;
    surfaces: Record<string, import("../catalog/types").CodeSample>;
  };
  export default samples;
}

declare module "virtual:kbui-setup-samples" {
  const samples: Record<
    | "usage"
    | "system"
    | "light"
    | "dark"
    | "styling"
    | "versionCheck"
    | `${import("./setup-model").Manager}-${boolean}`,
    import("../catalog/types").CodeSample
  >;
  export default samples;
}

declare module "virtual:kbui-changelog" {
  const releases: import("./changelog-model").Release[];
  export default releases;
}
