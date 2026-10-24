# Surface study evidence / 2026-10-23

This directory preserves evidence for shared component, overlay and motion changes. Experimental product screens remain archived, outside the shipped API and active Storybook catalog. Source archives contain the exact original source; manifests pin individual members and artifact hashes. Extract archives into a separate checkout to reproduce experimental surfaces. Do not overlay them onto a delivery branch.

- [G6-A accessibility follow-up and open obligations](accessibility-followup.md)
- [VoiceOver checklist — pending by owner instruction](accessibility-human-pass.md)
- [Original G6 source pins](goal6.json), [source archive](source-G6.tar.gz)
- [G6-A source pins](goal6-accessibility.json), [source archive](source-G6-accessibility.tar.gz)
- [Historical 54 responsive scenes](evidence-G6/responsive-scans.json), [12 task journeys](evidence-G6/task-journeys.json), [fresh consumer transfer](evidence-G6/transfer.json)
- [Follow-up native browser checks](evidence-G6-accessibility/native-browser-checks.json), [final modal scans](evidence-G6-accessibility/final-modal-scans.json)

Archives include experimental screen code, local assets and study records; screenshots and logs in these two evidence directories remain separate. Manifests also name prior study inputs and generated package artifacts not all checked into this packet. Those names preserve provenance, not a claim that this directory contains every named historical file. Original G6 inputs remain unchanged in the study worktree.

Historical study: 232 normal/reduced browser tests, 10 targeted forced-color checks and 48 study tests passed at G6-A. Delivery branches rerun shared package checks independently. Surface-specific product fixes remain in archived source; delivery adds reusable controls and focused public-API regressions. These counts must not be combined. Native WebView, alternative engine, spoken output and slower-hardware proof remain open.

Formal exact-head review needs a real PR round. No release or Bezl adoption follows from these fixtures. See [delivery stack contract](delivery.md) for slice ownership and current checks.
