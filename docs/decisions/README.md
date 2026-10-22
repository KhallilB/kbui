# Decision records

Each record explains one of kbui's larger choices: what was chosen, what was rejected, what it costs, and what would cause us to reconsider it. Write a new record when a change affects ownership between packages, breaks compatibility, or adds a significant dependency. Routine work does not need one.

Number a new record after the highest existing number. Never renumber existing records.

Every record uses the same sections: Status, Context, Decision, Options considered, Consequences, Soundness boundary, Threat model, Non-goals, Revisit if, Adoption, Validation and Links.

| # | Decision | Status |
|---|---|---|
| [0001](0001-framework-free-css-contract.md) | Keep styling in plain CSS, tied to components by an anatomy comment | Accepted 2026-10-16 |
| [0002](0002-base-ui-for-behavior.md) | Use Base UI for component behavior | Accepted 2026-10-16; writing our own primitives is still being considered |
| [0003](0003-local-path-installs.md) | Install kbui by local path instead of from a registry | Accepted 2026-10-18, to revisit before the first deploy |
| [0004](0004-dtcg-tokens-with-dark-extension.md) | Write tokens in the W3C format, with dark values in an extension | Accepted 2026-10-16 |
| [0005](0005-catalog-and-quality-layer-not-runtime.md) | Be the catalog and quality layer for generative UI, not a runtime | Accepted 2026-10-22; not built yet |
| [0006](0006-canonical-tree-adapters-at-edge.md) | Keep one tree format of our own, and translate outside formats at the edge | Accepted 2026-10-22; not built yet |
