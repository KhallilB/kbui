# G6 accessibility follow-up / G6-A

Status: implementation fixes verified; adoption held. VoiceOver sign-off stays pending at the owner's explicit request. Source remains uncommitted and unreleased.

## Fixed and proved

| Gap | Ownership and correction | Evidence |
|---|---|---|
| Mixed checkbox activation / read-only native projection | Shared Checkbox emits checked from mixed, preserves native indeterminate projection, exposes read-only state | Two failing assertions before fix; focused controls suite passes |
| Select description and empty popup | Shared trigger receives caller helper IDs; empty list contains disabled option | Helper assertion and real axe required-children failure before fix; unit/browser passes |
| Student validation association | Culture attaches error to acknowledgement, focuses it on rejection, clears error after correction | Failing behavior test before fix; study suite passes |
| Visible names differ from accessible names | Culture session choices and Operations inspection include visible labels | WCAG 2.1 A added to runtime scan; surface browser assertions pass |
| Forced-color selected/disabled controls | Shared button/radio CSS and consumer semantic palettes preserve selection and disabled distinction | Actual white-on-white radio assertion failed before fix; 10 targeted checks pass |
| Modal note contrast / close names | Decorative SVG close icons; explicit opaque note materials; bounded contrast/paint proof retained alongside raw scanner output | Final Commerce and Culture modal scans: zero violations and incomplete results; 6.40:1–15.07:1 note contrast |

## Verification actually run

- `bun run test:stories`: 232 pass / 42 files, Chromium normal and reduced-motion projects.
- `bun run --cwd apps/storybook test -- --config vitest.accessibility.config.ts`: 10 targeted forced-color checks pass; 106 unrelated tests skipped. This is not full-catalog forced-color certification.
- Study suite: 48 pass / 7 files. Focused shared-control suite: 11 pass / 2 files.
- Study TypeScript and production build pass. Final root gate recorded in `evidence-G6-accessibility/root-check.log`.
- Actual browser checks cover four ready contexts and three modal contexts, native Tab containment (eight cycles each), Escape/return, and paint metrics. Final post-icon Commerce/Culture scans are separately recorded in `final-modal-scans.json`.
- Nested Select/Dialog tested at 320 × 600: scrolling popup bounds, selection return, Escape popup-first dismissal, final trigger return. Surface fixtures cover narrow 390 and wide 1440; historical G6 contains 54 three-width state scans, not re-executed wholesale during this follow-up.

Logs and raw JSON: [follow-up evidence](evidence-G6-accessibility/). Original [G6 source packet](goal6.json) remains preserved; [G6-A pins](goal6-accessibility.json) identify this follow-up.

## Contrast adjudication boundary

`runtime/visualTextProof.ts` measures known opaque plain-text modal notes: computed foreground/background, WCAG threshold, glyph-center hit tests and viewport bounds. It rejects nested styled content, partial alpha, image backgrounds, ancestor opacity/filter/blend and text shadows. Four unsupported-paint negatives plus low contrast and covered text protect against false clearance. It does not certify arbitrary paint, all text geometry or spoken output. Raw axe incomplete records remain unmodified in earlier evidence; final native scans follow the close-icon correction.

## Independent review and formal gate

Independent read-only reviewer `surface_accessibility_review` reproduced five P2 issues with external probes. Fix-diff review passed six probes, then identified paint-witness false-clear risks and global story CSS leakage. Both were repaired, regression-tested and re-reviewed: no unresolved actionable findings in that reviewed delta. Final harness cleanup moved the same helper to runtime, removed unsupported locator options and diagnostic logging; close glyphs became decorative SVGs. This is independent source review, not independent region authorship or a formal exact-head clean gate.

Required Full-tier review-loop gate was invoked and **blocked**: scratch branch has no open PR review round; implementation is uncommitted. [Exact outcome](evidence-G6-accessibility/local-review-gate.log). No invented review round, commit or PR created. Committed review-sized slices and a real round remain prerequisites for formal gate closure.

## Open obligations / adoption hold

- **VoiceOver: pending by owner instruction.** [Human checklist](accessibility-human-pass.md). No spoken-output or native zoom sign-off inferred from automation.
- **Formal exact-head gate: blocked** as above.
- Native target Tauri WebView, alternative engine and slower hardware remain unverified. Firefox computer use was unavailable; no workaround attempted.
- Independent consumer composition remains unproved. Review independence does not retroactively establish author independence.
- Bezl source, packages and roadmap untouched. Package provenance/preparation and separate trial authorization remain required after these obligations are resolved.
