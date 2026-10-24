# Shared surface foundations delivery / 2026-10-23

Deliver shared components, material/motion extension seams and accessibility fixes from the approved surface study. Product policy, layouts and data remain consumer-owned. VoiceOver sign-off stays pending by owner instruction; release and Bezl adoption are outside these PRs.

## Bottom-up PR contract

| Slice / branch suffix | Parent | Behavior and acceptance | Proof | Production burden / non-goal |
| --- | --- | --- | --- | --- |
| surface-material-motion | main | Public material, typography, section and motion tokens; default timing and reduced-motion behavior retained; forced-color button palette | Root check + 166 browser checks | ~105 changed production lines; no renderer API |
| surface-overlay-composition | surface-material-motion | Dialog Header/Body/Footer native props and refs; Menu/Tooltip caller-owned portal host | Root check + 172 browser checks | 53 changed production lines; no product-specific modal |
| surface-checkbox | surface-overlay-composition | Controlled native checkbox, mixed resolves checked, read-only retains projection, labels/errors/forms/ref | Root check + 184 browser checks | ~140 production lines; no aggregate domain policy |
| surface-radio-group | surface-checkbox | Named controlled choice, disabled items, roving focus, inherited themes and forced-color selection | Root check + 198 browser checks | ~200 production lines; no consumer date/finish rules |
| surface-select | surface-radio-group | Controlled nullable option, empty disabled option, trigger helper/error, form and portal semantics | Root check + 210 browser checks | ~250 production lines; no filtering/domain policy |
| surface-accessibility-evidence | surface-select | Public nested Select/Dialog and accessibility regressions; API guide and pinned historical study proof | Root check + 218 browser checks + 4 targeted forced-color checks | Test/docs/evidence only; no experimental screens in active catalog |

All branch names carry `khallil/`. Every PR compares against its immediate parent; merge order is bottom-up after required review. Exports, CSS import list and token snapshots change incrementally because each component must be usable on its own head. Tests, documentation, generated snapshots and binary evidence are reported separately from production burden.

## Source preservation

Original study worktree is untouched. Delivery uses the same shared production files, with incremental export/import and token grouping changes. Token snapshots regenerate with the repository generator/tests. No new behavior introduced solely for packaging; existing Red/Green logs remain linked in [evidence](README.md).

## Decisions and open gates

1. Owner: “Let’s prepare reviewable PRs for the shared components, styling, motion and accessibility fixes. Keep the study evidence linked and VoiceOver sign-off pending.” Decision: prepare dependency-ordered draft PRs; keep adoption and release separate.
2. VoiceOver remains pending; browser checks cannot certify spoken output.
3. Formal review-loop bootstrap is unresolved: its gate requires an existing PR round, while submission requires the gate. No fabricated PR number or bypass used. Signed local commits and complete draft bodies may be prepared; first remote publication needs a documented route or explicit owner exception.

Native target WebView, alternative engines, physical monitor/hardware performance and independent consumer authorship remain unproved. Source re-review is distinct from formal exact-head review and merge readiness.
